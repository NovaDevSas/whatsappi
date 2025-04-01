'use client';

import { useState, useEffect, useRef } from 'react';
import { Conversation, Message } from '@/types';
import MessageForm from './MessageForm';

interface ConversationDetailProps {
  conversation: Conversation | null;
  onSendMessage: (phoneNumber: string, message: string) => Promise<{ success: boolean; error?: string }>;
}

export default function ConversationDetail({ 
  conversation, 
  onSendMessage 
}: ConversationDetailProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (conversation) {
      fetchMessages(conversation.id);
    } else {
      setMessages([]);
    }
  }, [conversation]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

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
      
      setMessages((prev) => [...prev, newMessage]);
      
      // Optionally, refetch messages to ensure consistency
      // fetchMessages(conversation.id);
    }
    
    return result;
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  if (!conversation) {
    return (
      <div className="h-full flex items-center justify-center bg-gray-50 p-8 rounded-lg border">
        <p className="text-gray-500">Select a conversation to view messages</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full border rounded-lg overflow-hidden">
      {/* Conversation header */}
      <div className="bg-white p-4 border-b flex items-center">
        <div className="flex-shrink-0 h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 mr-3">
          {(conversation.contact?.name?.[0] || conversation.phoneNumber[0]).toUpperCase()}
        </div>
        <div>
          <h2 className="font-medium">
            {conversation.contact?.name || conversation.phoneNumber}
          </h2>
          <p className="text-sm text-gray-500">{conversation.phoneNumber}</p>
        </div>
      </div>
      
      {/* Messages area */}
      <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
        {loading ? (
          <div className="text-center p-4">Loading messages...</div>
        ) : error ? (
          <div className="text-center p-4 text-red-500">{error}</div>
        ) : messages.length === 0 ? (
          <div className="text-center p-4 text-gray-500">No messages yet</div>
        ) : (
          <div className="space-y-4">
            {messages.map((message) => (
              <div 
                key={message.id}
                className={`max-w-[75%] p-3 rounded-lg ${
                  message.direction === 'incoming' 
                    ? 'bg-white ml-0 mr-auto' 
                    : 'bg-blue-100 ml-auto mr-0'
                }`}
              >
                <p>{message.message}</p>
                <p className="text-xs text-gray-500 mt-1 text-right">
                  {new Date(message.timestamp).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>
      
      {/* Message input */}
      <div className="p-4 bg-white border-t">
        <MessageForm 
          onSendMessage={(_, message) => handleSendMessage(conversation.phoneNumber, message)} 
          hidePhoneNumber={true}
        />
      </div>
    </div>
  );
}