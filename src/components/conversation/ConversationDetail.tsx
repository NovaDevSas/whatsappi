'use client';

import { useState, useEffect, useRef } from 'react';
import { Conversation, Message } from '@/types';
import MessageForm from '../chat/MessageForm';

interface ConversationDetailProps {
  conversation: Conversation | null;
  onSendMessage: (phoneNumber: string, message: string) => Promise<{ success: boolean; error?: string }>;
}

// Add interface for message groups
interface MessageGroup {
  date: string;
  messages: Message[];
}

export default function ConversationDetail({ 
  conversation, 
  onSendMessage 
}: ConversationDetailProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [messageGroups, setMessageGroups] = useState<MessageGroup[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (conversation) {
      fetchMessages(conversation.id);
    } else {
      setMessages([]);
      setMessageGroups([]);
    }
  }, [conversation]);

  useEffect(() => {
    // Group messages by date whenever messages change
    if (messages.length > 0) {
      setMessageGroups(groupMessagesByDate(messages));
    } else {
      setMessageGroups([]);
    }
  }, [messages]);

  useEffect(() => {
    // Only scroll if we have messages and they're not loading
    if (messages.length > 0 && !loading) {
      scrollToBottom();
    }
  }, [messages, loading]);

  const fetchMessages = async (conversationId: string) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`/api/conversations/${conversationId}/messages`);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch messages');
      }
      
      const data = await response.json();
      
      if (data.messages && Array.isArray(data.messages)) {
        setMessages(data.messages);
      } else {
        console.warn('Unexpected response format:', data);
        setMessages([]);
      }
    } catch (err) {
      console.error('Error fetching messages:', err);
      setError(err instanceof Error ? err.message : 'Failed to load messages');
    } finally {
      setLoading(false);
    }
  };

  // Add function to group messages by date
  const groupMessagesByDate = (messages: Message[]): MessageGroup[] => {
    // Sort messages by timestamp
    const sortedMessages = [...messages].sort((a, b) => 
      new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    );
    
    const groups: MessageGroup[] = [];
    let currentDate: string | null = null;
    let currentGroup: Message[] = [];
    
    sortedMessages.forEach(message => {
      const messageDate = new Date(message.timestamp);
      
      // Verify date is valid
      if (isNaN(messageDate.getTime())) {
        console.warn('Invalid timestamp:', message.timestamp);
        return;
      }
      
      // Format YYYY-MM-DD for consistent comparison
      const dateStr = messageDate.toISOString().split('T')[0];
      
      if (dateStr !== currentDate) {
        // If we have a current group, save it
        if (currentDate && currentGroup.length > 0) {
          groups.push({
            date: currentDate,
            messages: [...currentGroup]
          });
        }
        
        // Start a new group
        currentDate = dateStr;
        currentGroup = [message];
      } else {
        // Add to current group
        currentGroup.push(message);
      }
    });
    
    // Don't forget to add the last group
    if (currentDate && currentGroup.length > 0) {
      groups.push({
        date: currentDate,
        messages: currentGroup
      });
    }
    
    return groups;
  };

  // Add function to get readable date format
  const getReadableDate = (dateStr: string): string => {
    // Convert from ISO format (YYYY-MM-DD) to Date
    const date = new Date(dateStr);
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    if (date.toDateString() === today.toDateString()) {
      return "Hoy";
    } else if (date.toDateString() === yesterday.toDateString()) {
      return "Ayer";
    } else {
      // More friendly format: "1 de enero de 2023"
      return date.toLocaleDateString('es-ES', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      });
    }
  };

  const handleSendMessage = async (phoneNumber: string, message: string) => {
    const result = await onSendMessage(phoneNumber, message);
    
    if (result.success && conversation) {
      // Add the sent message to the UI immediately
      const newMessage: Message = {
        id: `temp_${Date.now()}`,
        phoneNumber,
        message,
        timestamp: new Date().toISOString(),
        direction: 'outgoing',
      };
      
      setMessages(prevMessages => [...prevMessages, newMessage]);
      
      // Refresh messages to get the server-generated ID
      setTimeout(() => {
        fetchMessages(conversation.id);
      }, 1000);
    }
    
    return result;
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  if (!conversation) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-50 p-6">
        <p className="text-gray-500">Selecciona una conversación para ver los mensajes</p>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-white">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200 flex items-center">
        <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 font-medium mr-3">
          {(conversation.contact?.name || conversation.phoneNumber)[0].toUpperCase()}
        </div>
        <div>
          <h2 className="text-lg font-medium text-gray-900">
            {conversation.contact?.name || conversation.phoneNumber}
          </h2>
        </div>
      </div>
      
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6">
        {loading ? (
          <div className="flex justify-center items-center h-full">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
          </div>
        ) : error ? (
          <div className="text-red-500 text-center">{error}</div>
        ) : messageGroups.length === 0 ? (
          <div className="text-gray-500 text-center">No hay mensajes aún</div>
        ) : (
          <div className="space-y-6">
            {messageGroups.map((group, groupIndex) => (
              <div key={group.date} className="space-y-4">
                {/* Date header */}
                <div className="flex justify-center">
                  <div className="bg-gray-100 text-gray-600 text-sm px-4 py-1 rounded-full">
                    {getReadableDate(group.date)}
                  </div>
                </div>
                
                {/* Messages in this group */}
                {group.messages.map((message, messageIndex) => (
                  <div 
                    key={`${message.id}-${messageIndex}`} 
                    className={`flex ${message.direction === 'outgoing' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div 
                      className={`max-w-[70%] p-4 rounded-lg ${
                        message.direction === 'outgoing' 
                          ? 'bg-purple-100 text-purple-900' 
                          : 'bg-gray-100 text-gray-900'
                      }`}
                    >
                      <p>{message.message}</p>
                      <p className="text-xs text-gray-500 mt-1 text-right">
                        {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>
      
      {/* Message Form */}
      <div className="border-t border-gray-200 p-4">
        <MessageForm 
          onSendMessage={handleSendMessage} 
          hidePhoneNumber={true}
          initialPhoneNumber={conversation.phoneNumber}
        />
      </div>
    </div>
  );
}