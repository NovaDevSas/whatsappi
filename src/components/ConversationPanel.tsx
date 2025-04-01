import { useState } from 'react';
import { useConversations } from '@/contexts/ConversationContext';

export default function ConversationPanel() {
  const { 
    conversations, 
    selectedConversation, 
    selectConversation, 
    loading, 
    error 
  } = useConversations();
  
  const [searchQuery, setSearchQuery] = useState('');

  const filteredConversations = conversations.filter(conversation => {
    const name = conversation.contact?.name || conversation.phoneNumber;
    return name.toLowerCase().includes(searchQuery.toLowerCase());
  });

  return (
    // Cambiando el ancho de w-80 a w-96 para hacer el panel más grande
    <div className="w-96 border-r border-gray-200 bg-white overflow-y-auto">
      <div className="p-4">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Conversations</h2>
        
        {/* Search */}
        <div className="relative mb-4">
          <input
            type="text"
            placeholder="Search..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
          <svg
            className="absolute right-3 top-2.5 h-5 w-5 text-gray-400"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
              clipRule="evenodd"
            />
          </svg>
        </div>
      </div>
      
      {/* Conversation List */}
      {loading.conversations ? (
        <div className="flex justify-center p-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
        </div>
      ) : error.conversations ? (
        <div className="p-4 text-red-500">{error.conversations}</div>
      ) : filteredConversations.length === 0 ? (
        <div className="p-4 text-center text-gray-500">No conversations found</div>
      ) : (
        <ul className="divide-y divide-gray-200">
          {filteredConversations.map((conversation) => (
            <li 
              key={conversation.id}
              onClick={() => selectConversation(conversation)}
              className={`px-4 py-3 hover:bg-gray-50 cursor-pointer transition-colors ${
                selectedConversation?.id === conversation.id ? 'bg-purple-50' : ''
              }`}
            >
              <div className="flex items-center">
                <div className="flex-shrink-0 h-10 w-10 rounded-full bg-purple-500 flex items-center justify-center text-white font-medium">
                  {(conversation.contact?.name?.[0] || conversation.phoneNumber[0]).toUpperCase()}
                </div>
                <div className="ml-3 min-w-0 flex-1">
                  <div className="flex justify-between items-baseline">
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
                  <div className="flex justify-between">
                    <p className="text-sm text-gray-500 truncate">
                      {conversation.lastMessage?.text || 'No messages yet'}
                    </p>
                    {conversation.unreadCount > 0 && (
                      <span className="inline-flex items-center justify-center h-5 w-5 rounded-full bg-purple-600 text-xs font-medium text-white">
                        {conversation.unreadCount}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}