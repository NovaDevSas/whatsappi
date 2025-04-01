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
      <div className="flex flex-col items-center justify-center h-full p-8 text-center">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
        <h3 className="text-lg font-medium text-gray-500">Select a conversation</h3>
        <p className="text-gray-400 mt-1">Choose a contact from the list to view messages</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-white rounded-lg shadow-sm overflow-hidden">
      {/* Conversation header */}
      <div className="flex items-center p-4 border-b border-gray-200 bg-white">
        <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-medium mr-3">
          {(conversation.contact?.name?.[0] || conversation.phoneNumber[0]).toUpperCase()}
        </div>
        <div>
          <h2 className="font-medium text-gray-900">
            {conversation.contact?.name || conversation.phoneNumber}
          </h2>
          <p className="text-sm text-gray-500">{conversation.phoneNumber}</p>
        </div>
      </div>
      
      {/* Messages area */}
      <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="inline-block animate-spin rounded-full h-6 w-6 border-2 border-blue-500 border-t-transparent"></div>
            <p className="ml-2 text-gray-600 text-sm">Cargando mensajes...</p>
          </div>
        ) : error ? (
          <div className="flex items-center justify-center h-full text-red-500">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-sm">{error}</p>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex items-center justify-center h-full text-gray-500">
            <p className="text-sm">No hay mensajes. ¡Inicia la conversación!</p>
          </div>
        ) : (
          // In the messages mapping section, we need to ensure unique keys
          // Change this part around line 100-120
          <div className="flex flex-col space-y-2">
            {messages.map((message, index) => (
              <div 
                key={`${message.id}-${index}`} // Add index to ensure uniqueness
                className={`message-bubble ${
                  message.direction === 'incoming' ? 'incoming' : 'outgoing'
                }`}
              >
                <p className="text-sm">{message.message}</p>
                <p className={`text-xs mt-1 text-right ${
                  message.direction === 'incoming' ? 'text-gray-500' : 'text-blue-100'
                }`}>
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
      
      {/* Message form */}
      <div className="p-4 bg-white border-t border-gray-200">
        <MessageForm 
          onSendMessage={handleSendMessage} 
          hidePhoneNumber={true} 
          initialPhoneNumber={conversation.phoneNumber} 
        />
      </div>
    </div>
  );
}