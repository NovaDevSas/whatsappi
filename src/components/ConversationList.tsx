'use client';

import { useState, useEffect } from 'react';
import { Conversation } from '@/types';

interface ConversationListProps {
  onSelectConversation: (conversation: Conversation) => void;
  selectedConversationId?: string;
}

export default function ConversationList({ 
  onSelectConversation, 
  selectedConversationId 
}: ConversationListProps) {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchConversations = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/conversations');
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to fetch conversations');
        }
        
        const data = await response.json();
        
        if (data.conversations && Array.isArray(data.conversations)) {
          setConversations(data.conversations);
        } else {
          console.warn('Unexpected response format:', data);
          setConversations([]);
        }
      } catch (err) {
        console.error('Error fetching conversations:', err);
        setError(err instanceof Error ? err.message : 'Failed to load conversations');
      } finally {
        setLoading(false);
      }
    };

    fetchConversations();
  }, []);

  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
      <div className="bg-white p-4 border-b border-gray-100">
        <h2 className="font-medium text-gray-900">Conversations</h2>
      </div>
      
      {loading ? (
        <div className="p-4 text-center">
          <div className="inline-block animate-spin rounded-full h-6 w-6 border-2 border-blue-500 border-t-transparent"></div>
          <p className="mt-2 text-gray-600 text-sm">Cargando contactos...</p>
        </div>
      ) : error ? (
        <div className="p-4 text-center text-red-500">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-sm">{error}</p>
        </div>
      ) : conversations.length === 0 ? (
        <div className="p-4 text-center text-gray-500">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
          <p className="text-sm">No se encontraron contactos</p>
        </div>
      ) : (
        <ul className="divide-y divide-gray-100 max-h-[60vh] overflow-y-auto">
          {conversations.map((conversation) => (
            <li 
              key={conversation.phoneNumber}
              className={`conversation-item p-3 cursor-pointer ${
                selectedConversationId === conversation.id ? 'active' : ''
              }`}
              onClick={() => onSelectConversation(conversation)}
            >
              <div className="flex items-center space-x-3">
                <div className="flex-shrink-0 h-10 w-10 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center text-white font-medium">
                  {(conversation.contact?.name?.[0] || conversation.phoneNumber[0]).toUpperCase()}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {conversation.contact?.name || conversation.phoneNumber}
                  </p>
                  {conversation.lastMessage ? (
                    <p className="text-xs text-gray-500 truncate">
                      {conversation.lastMessage.text}
                    </p>
                  ) : (
                    <p className="text-xs text-gray-400 italic">
                      No hay mensajes
                    </p>
                  )}
                </div>
                <div className="flex flex-col items-end">
                  {conversation.lastMessage && (
                    <p className="text-xs text-gray-500">
                      {new Date(conversation.lastMessage.timestamp).toLocaleDateString()}
                    </p>
                  )}
                  {conversation.unreadCount > 0 && (
                    <span className="inline-flex items-center justify-center h-5 w-5 rounded-full bg-blue-600 text-xs font-medium text-white mt-1">
                      {conversation.unreadCount}
                    </span>
                  )}
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}