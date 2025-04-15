import { useState, useEffect, useCallback } from 'react';
import Sidebar from '../layout/Sidebar';
import ConversationPanel from '../conversation/ConversationPanel';
import ChatPanel from '../chat/ChatPanel';
import Dashboard from '../dashboard/Dashboard';
import { useWebSocket } from '@/contexts/WebSocketContext';
import { useConversations } from '@/contexts/ConversationContext';

// Componentes auxiliares para el Dashboard
const StatCard = ({ title, value, icon, color }) => (
  <div className="bg-white rounded-lg shadow p-6 flex items-center">
    <div className={`w-12 h-12 rounded-full ${color} flex items-center justify-center mr-4`}>
      {icon}
    </div>
    <div>
      <p className="text-sm text-gray-500">{title}</p>
      <p className="text-2xl font-bold">{value}</p>
    </div>
  </div>
);

// Otros componentes auxiliares (MessageIcon, SendIcon, UserIcon, RecentChat)
const MessageIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
  </svg>
);

const SendIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
  </svg>
);

const UserIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
  </svg>
);

const RecentChat = ({ name, email, time, status }) => (
  <div className="flex items-center justify-between">
    <div className="flex items-center">
      <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 font-medium mr-3">
        {name[0]}
      </div>
      <div>
        <p className="text-sm font-medium">{name}</p>
        <p className="text-xs text-gray-500">{email}</p>
      </div>
    </div>
    <div className="text-right">
      <p className="text-xs text-gray-500">{time}</p>
      <p className="text-xs text-green-500">{status}</p>
    </div>
  </div>
);

export default function ChatLayout() {
  const [activeView, setActiveView] = useState<'chat' | 'dashboard'>('dashboard');
  const [sidebarVisible, setSidebarVisible] = useState(true);
  const { isConnected, lastMessage } = useWebSocket();
  const { activeConversation, setActiveConversation, refreshMessages } = useConversations();
  const [isMobile, setIsMobile] = useState(false);
  
  // Detectar si estamos en la página de chat y cambiar la vista activa
  useEffect(() => {
    // Si estamos en la ruta /chat, cambiar a la vista de chat
    if (window.location.pathname.includes('/chat')) {
      setActiveView('chat');
    }
    
    // Detectar si estamos en un dispositivo móvil
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 768);
      // En móvil, ocultar el sidebar por defecto
      if (window.innerWidth < 768) {
        setSidebarVisible(false);
      }
    };
    
    // Verificar al cargar y cuando cambie el tamaño de la ventana
    checkIfMobile();
    window.addEventListener('resize', checkIfMobile);
    
    return () => window.removeEventListener('resize', checkIfMobile);
  }, []);
  
  // Memoize refreshMessages to avoid recreating it on every render
  const memoizedRefreshMessages = useCallback(() => {
    if (activeConversation) {
      refreshMessages();
    }
  }, [activeConversation, refreshMessages]);
  
  // Effect for handling conversation selection
  useEffect(() => {
    if (activeConversation) {
      memoizedRefreshMessages();
    }
  }, [activeConversation, memoizedRefreshMessages]);
  
  // Listen for new messages via WebSocket
  useEffect(() => {
    if (lastMessage && activeConversation && lastMessage.phoneNumber === activeConversation.phoneNumber) {
      // Add a check to prevent excessive refreshes
      const messageTimestamp = new Date(lastMessage.timestamp).getTime();
      const currentTime = Date.now();
      const isRecentMessage = (currentTime - messageTimestamp) < 10000; // Only refresh for messages less than 10 seconds old
      
      if (isRecentMessage) {
        memoizedRefreshMessages();
      }
    }
  }, [lastMessage, activeConversation, memoizedRefreshMessages]);

  // Estado para controlar la visibilidad del panel de conversaciones en móvil
  const [showConversations, setShowConversations] = useState(true);
  
  // Función para volver a la lista de conversaciones en móvil
  const handleBackToConversations = () => {
    setShowConversations(true);
  };

  // Función para mostrar el chat activo cuando se selecciona una conversación
  const handleSelectConversation = (conversation: any) => {
    setActiveConversation(conversation);
    // En móvil, ocultar la lista de conversaciones y mostrar el chat
    if (window.innerWidth < 768) {
      setShowConversations(false);
    }
    // Asegurar que estamos en la vista de chat
    setActiveView('chat');
  };

  return (
    <div className="flex h-screen bg-purple-50 relative overflow-hidden">
      {/* Botón flotante para mostrar/ocultar sidebar - visible en móvil o cuando el sidebar está oculto */}
      {(isMobile || !sidebarVisible) && (
        <button 
          onClick={() => setSidebarVisible(!sidebarVisible)}
          className="fixed top-4 left-4 z-50 p-3 bg-white rounded-full shadow-lg text-purple-600 hover:bg-purple-50 transition-all sidebar-toggle glow-purple"
          aria-label={sidebarVisible ? "Ocultar menú" : "Mostrar menú"}
        >
          {sidebarVisible ? (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <div className="h-6 w-6 rounded-full bg-purple-600 text-white flex items-center justify-center font-bold text-xl">
              N
            </div>
          )}
        </button>
      )}
      
      {/* Sidebar con visibilidad condicional en móvil */}
      <div className={`${isMobile && !sidebarVisible ? 'hidden' : 'block'} z-20 transition-all duration-300 h-full`}>
        <Sidebar activeView={activeView} onViewChange={setActiveView} />
      </div>
      
      {/* Main Content */}
      <div className={`flex-1 flex flex-col overflow-hidden transition-all duration-300 ${sidebarVisible ? '' : 'ml-0'} h-full`}>
        {/* WebSocket Connection Status - Solo visible cuando es necesario */}
        {!isConnected && (
          <div className="bg-purple-100 text-purple-800 px-4 py-2 text-sm sticky top-0 z-50 shadow-sm">
            Connecting to server for real-time updates...
          </div>
        )}
        
        {/* Dashboard View sin toggle */}
        {activeView === 'dashboard' && (
          <div className="relative h-full overflow-auto">
            <Dashboard />
          </div>
        )}
        
        {/* Chat View - Modificado para mejor experiencia móvil */}
        {activeView === 'chat' && (
          <div className="flex-1 flex overflow-hidden h-full">
            {/* Panel de conversaciones con visibilidad condicional en móvil */}
            <div className={`${showConversations ? 'block' : 'hidden md:block'} md:w-96 w-full h-full overflow-hidden`}>
              <ConversationPanel onSelectConversation={handleSelectConversation} />
            </div>
            
            {/* Panel de chat con visibilidad condicional en móvil y botón para volver */}
            <div className={`${!showConversations ? 'block' : 'hidden md:block'} flex-1 h-full overflow-hidden`}>
              {activeConversation && (
                <div className="md:hidden bg-white border-b border-gray-200 px-4 py-3">
                  <button 
                    onClick={handleBackToConversations}
                    className="flex items-center text-purple-600"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L4.414 9H17a1 1 0 110 2H4.414l5.293 5.293a1 1 0 010 1.414z" clipRule="evenodd" />
                    </svg>
                    Volver a conversaciones
                  </button>
                </div>
              )}
              <ChatPanel />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}