import { useState } from 'react';
import { useConversations } from '@/contexts/ConversationContext';

export default function ConversationPanel() {
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

  return (
    // Mantenemos el ancho pero mejoramos el diseño general
    <div className="w-96 border-r border-gray-200 bg-white overflow-y-auto">
      <div className="p-5">
        <h2 className="text-2xl font-semibold text-gray-800 mb-5">Conversations</h2>
        
        {/* Search con diseño mejorado */}
        <div className="relative mb-6">
          <input
            type="text"
            placeholder="Search..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 bg-gray-50 transition-all"
          />
          <svg
            className="absolute right-3 top-3.5 h-5 w-5 text-gray-400"
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
      
      {/* Lista de conversaciones con mejor espaciado y diseño minimalista */}
      <div className="px-3">
        {isLoading ? (
          <div className="flex justify-center items-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
          </div>
        ) : conversations.length === 0 ? (
          <div className="text-gray-500 text-center py-8">No conversations found</div>
        ) : filteredConversations.length === 0 ? (
          <div className="text-gray-500 text-center py-8">No conversations found</div>
        ) : (
          <div className="space-y-3 pb-4">
            {filteredConversations.map(conversation => {
              const isSelected = selectedConversation?.id === conversation.id;
              const name = conversation.contact?.name || conversation.phoneNumber;
              // Fix: Extract the text from lastMessage if it's an object
              const lastMessageText = typeof conversation.lastMessage === 'object' 
                ? conversation.lastMessage.text 
                : (conversation.lastMessage || '');
              const time = conversation.lastMessageTime 
                ? new Date(conversation.lastMessageTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                : '';
              
              // Determinamos la primera letra para el avatar o usamos un símbolo específico
              const initial = name[0]?.toUpperCase() || '?';
              
              return (
                <div
                  key={conversation.id}
                  onClick={() => selectConversation(conversation)}
                  className={`p-4 border-b border-gray-100 hover:bg-gray-50 transition-colors cursor-pointer ${
                    isSelected ? 'bg-purple-50' : ''
                  }`}
                >
                  <div className="flex items-center">
                    {/* Avatar sin indicador de en línea */}
                    <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 font-medium mr-3">
                      {initial}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-center">
                        <h3 className="text-sm font-medium text-gray-900 truncate">{name}</h3>
                        <span className="text-xs text-gray-500">{time}</span>
                      </div>
                      <p className="text-xs text-gray-500 truncate mt-1">
                        {lastMessageText || 'No hay mensajes'}
                      </p>
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