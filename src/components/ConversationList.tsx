'use client';

import { useState, useEffect } from 'react';
import { Conversation } from '@/types';
import Image from 'next/image';

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

  if (loading) {
    return <div className="p-4 text-center">Loading conversations...</div>;
  }

  if (error) {
    return <div className="p-4 text-center text-red-500">{error}</div>;
  }

  if (conversations.length === 0) {
    return <div className="p-4 text-center">No conversations found</div>;
  }

  return (
    <div className="border rounded-lg overflow-hidden">
      <div className="bg-gray-100 p-3 border-b">
        <h2 className="font-medium">Conversations</h2>
      </div>
      <ul className="divide-y">
        {conversations.map((conversation) => (
          <li 
            key={conversation.id}
            className={`p-3 hover:bg-gray-50 cursor-pointer ${
              selectedConversationId === conversation.id ? 'bg-blue-50' : ''
            }`}
            onClick={() => onSelectConversation(conversation)}
          >
            <div className="flex items-center space-x-3">
              <div className="flex-shrink-0 h-10 w-10 rounded-full bg-gray-200 overflow-hidden">
                {conversation.contact?.profilePicture ? (
                  <Image 
                    src={conversation.contact.profilePicture}
                    alt={conversation.contact.name || 'Contact'}
                    width={40}
                    height={40}
                  />
                ) : (
                  <div className="h-full w-full flex items-center justify-center text-gray-500">
                    {(conversation.contact?.name?.[0] || conversation.phoneNumber[0]).toUpperCase()}
                  </div>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex justify-between">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {conversation.contact?.name || conversation.phoneNumber}
                  </p>
                  {conversation.lastMessage && (
                    <p className="text-xs text-gray-500">
                      {new Date(conversation.lastMessage.timestamp).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  )}
                </div>
                {conversation.lastMessage && (
                  <p className="text-sm text-gray-500 truncate">
                    {conversation.lastMessage.text}
                  </p>
                )}
              </div>
              {conversation.unreadCount > 0 && (
                <div className="flex-shrink-0 ml-2">
                  <span className="inline-flex items-center justify-center h-5 w-5 rounded-full bg-blue-600 text-xs font-medium text-white">
                    {conversation.unreadCount}
                  </span>
                </div>
              )}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}