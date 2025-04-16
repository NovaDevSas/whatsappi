import { useState, useEffect } from 'react';
import { useConversations } from '@/contexts/ConversationContext';

interface ConversationPanelProps {
  isMobile?: boolean;
  onConversationSelect?: () => void;
}

export default function ConversationPanel({ isMobile = false, onConversationSelect }: ConversationPanelProps) {
  const { 
    conversations, 
    activeConversation: selectedConversation, 
    setActiveConversation: selectConversation
  } = useConversations();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const filteredConversations = conversations.filter(conversation => {
    const name = conversation.contact?.name || conversation.phoneNumber;
    return name.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const handleConversationSelect = (conversation) => {
    selectConversation(conversation);
    // If on mobile, notify parent to hide conversation list
    if (isMobile && onConversationSelect) {
      onConversationSelect();
    }
  };

  return (
    <div className="w-full md:w-96 border-r border-gray-200 bg-white flex flex-col h-full">
      <div className="p-3 md:p-4 border-b border-gray-200 sticky top-0 z-10 bg-white shadow-sm">
        <h2 className="text-xl font-semibold text-gray-800 mb-3">Conversations</h2>
        
        {/* Search input */}
        <div className="relative">
          <input
            type="text"
            placeholder="Search..."
            className="w-full p-2 pl-9 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-500 text-base"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <svg
            className="absolute left-3 top-2.5 h-5 w-5 text-gray-400"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>
      </div>
      
      {/* Conversation list - scrollable */}
      <div className="flex-1 overflow-y-auto p-2 md:p-3">
        {isLoading ? (
          <div className="flex justify-center py-10">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
          </div>
        ) : filteredConversations.length === 0 ? (
          <div className="text-center text-gray-500 py-10">
            <p>No conversations found</p>
          </div>
        ) : (
          <div className="space-y-2">
            {filteredConversations.map((conversation) => {
              const isSelected = selectedConversation?.id === conversation.id;
              const name = conversation.contact?.name || conversation.phoneNumber;
              const initial = name.charAt(0).toUpperCase();
              
              return (
                <div
                  key={conversation.id}
                  className={`p-3 rounded-lg cursor-pointer transition-all duration-200 ${
                    isSelected
                      ? 'bg-purple-100 border-l-4 border-purple-500'
                      : 'hover:bg-gray-50'
                  }`}
                  onClick={() => handleConversationSelect(conversation)}
                >
                  <div className="flex items-center">
                    <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 font-medium mr-3 flex-shrink-0">
                      {initial}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-center">
                        <h3 className="font-medium text-gray-900 truncate">{name}</h3>
                        {conversation.lastMessage?.timestamp && (
                          <span className="text-xs text-gray-500 flex-shrink-0 ml-1">
                            {new Date(conversation.lastMessage.timestamp).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                        )}
                      </div>
                      {conversation.lastMessage?.text && (
                        <p className="text-sm text-gray-500 truncate">
                          {conversation.lastMessage.text}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}