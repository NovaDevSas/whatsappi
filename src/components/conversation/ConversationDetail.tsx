'use client';

import { useState, useEffect, useRef } from 'react';
import { Conversation, Message } from '@/types';
import MessageForm from '../chat/MessageForm';

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
    <div className="flex flex-col h-full bg-white rounded-lg shadow overflow-hidden">
      {conversation ? (
        <>
          <div className="p-4 border-b border-gray-200 bg-white">
            <div className="flex items-center">
              <div className="flex-shrink-0 h-10 w-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-medium">
                {conversation.phoneNumber[0].toUpperCase()}
              </div>
              <div className="ml-3">
                <h2 className="text-lg font-medium text-gray-900">
                  {conversation.phoneNumber}
                </h2>
              </div>
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
            {loading ? (
              <div className="flex justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-400"></div>
              </div>
            ) : error ? (
              <div className="text-red-500">{error}</div>
            ) : (
              <div className="space-y-3">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.direction === 'outgoing' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                        message.direction === 'outgoing'
                          ? 'bg-blue-500 text-white'
                          : 'bg-white text-gray-800 border border-gray-200'
                      }`}
                    >
                      <p>{message.message}</p>
                      <p className="text-xs mt-1 opacity-70">
                        {new Date(message.timestamp).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>
            )}
          </div>
          
          <div className="p-4 border-t border-gray-200 bg-white">
            <MessageForm 
              onSendMessage={handleSendMessage} 
              hidePhoneNumber={true} 
              initialPhoneNumber={conversation.phoneNumber} 
            />
          </div>
        </>
      ) : (
        <div className="flex-1 flex items-center justify-center p-8 text-center">
          <div>
            <h3 className="text-lg font-medium text-gray-900">
              No conversation selected
            </h3>
            <p className="mt-1 text-gray-500">
              Select a conversation from the list to view messages
            </p>
          </div>
        </div>
      )}
    </div>
  );
}