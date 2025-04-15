import React, { useRef, useEffect, useState } from 'react';
import { useConversations } from '@/contexts/ConversationContext';
import { useWebSocket } from '@/contexts/WebSocketContext';

export default function ChatPanel() {
  const { activeConversation, messages, sendMessage, refreshMessages } = useConversations();
  const { isConnected, notificationsEnabled, toggleNotifications } = useWebSocket();
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [showContactInfo, setShowContactInfo] = useState(false);
  const [sendError, setSendError] = useState<string | null>(null);
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);
  const [isMobile, setIsMobile] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Detectar si estamos en un dispositivo móvil
  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    // Verificar al cargar y cuando cambie el tamaño de la ventana
    checkIfMobile();
    window.addEventListener('resize', checkIfMobile);
    
    return () => window.removeEventListener('resize', checkIfMobile);
  }, []);
  
  // Scroll to bottom when messages change
  useEffect(() => {
    if (messages.length > 0) {
      scrollToBottom();
    }
  }, [messages]);
  
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };
  
  const handleRefreshMessages = async () => {
    if (!activeConversation) return;
    
    setIsLoadingMessages(true);
    try {
      await refreshMessages();
      setLastRefresh(new Date());
    } finally {
      setIsLoadingMessages(false);
      // Scroll to bottom after messages are loaded
      setTimeout(scrollToBottom, 100);
    }
  };
  
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newMessage.trim() || !activeConversation) return;
    
    setIsLoading(true);
    setSendError(null); // Clear any previous errors
    
    try {
      const success = await sendMessage(activeConversation.phoneNumber, newMessage);
      if (success) {
        setNewMessage('');
        setLastRefresh(new Date());
      } else {
        setSendError('Failed to send message. Please try again.');
      }
    } catch (error) {
      console.error('Error sending message:', error);
      setSendError('An error occurred while sending the message.');
    } finally {
      setIsLoading(false);
    }
  };

  // If no conversation is selected, show a placeholder
  if (!activeConversation) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-gray-50 p-8">
        <div className="text-center">
          <h3 className="text-lg font-medium text-gray-900 mb-2">No conversation selected</h3>
          <p className="text-gray-500">Select a conversation from the list or start a new one</p>
        </div>
      </div>
    );
  }

  // Add this new function to test notifications
  const testNotification = () => {
    console.log('Testing notification...');
    
    if (!('Notification' in window)) {
      alert('This browser does not support notifications');
      return;
    }
    
    console.log('Current notification permission:', Notification.permission);
    
    if (Notification.permission === 'granted') {
      showTestNotification();
    } else if (Notification.permission !== 'denied') {
      Notification.requestPermission().then(permission => {
        console.log('Permission response:', permission);
        if (permission === 'granted') {
          showTestNotification();
        } else {
          alert('Notification permission was not granted');
        }
      });
    } else {
      alert('Notification permission denied. Please enable notifications in your browser settings.');
    }
  };
  
  // Separate function to show the test notification
  const showTestNotification = () => {
    try {
      const notification = new Notification('Test Notification', {
        body: 'This is a test notification from WhatsApp',
        icon: '/favicon.ico'
      });
      
      // Auto close after 5 seconds
      setTimeout(() => notification.close(), 5000);
      
      // Handle click
      notification.onclick = () => {
        window.focus();
        notification.close();
      };
    } catch (error) {
      console.error('Error creating notification:', error);
      alert('Error creating notification: ' + error);
    }
  };

  return (
    <div className="flex-1 flex h-full overflow-hidden">
      <div className={`flex-1 flex flex-col ${showContactInfo && !isMobile ? 'hidden md:flex' : 'flex'}`}>
        {/* Chat header - Mejorado con botón de retorno y mejor organización */}
        <div className="bg-white border-b border-gray-200 px-4 py-3 flex justify-between items-center sticky-header shadow-sm">
          <div className="flex items-center">
            {/* Botón para volver a la lista de conversaciones en móvil y escritorio */}
            <button 
              onClick={() => window.location.href = '/chat'}
              className="mr-2 p-2 rounded-full hover:bg-purple-50 text-purple-600 transition-all"
              title="Volver a conversaciones"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L4.414 9H17a1 1 0 110 2H4.414l5.293 5.293a1 1 0 010 1.414z" clipRule="evenodd" />
              </svg>
            </button>
            
            <div className="flex items-center">
              <div 
                className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 font-medium mr-3"
              >
                {activeConversation.contact?.name?.[0]?.toUpperCase() || activeConversation.phoneNumber[0]}
              </div>
              <div>
                <h2 className="font-medium text-gray-800">
                  {activeConversation.contact?.name || activeConversation.phoneNumber}
                </h2>
                <div className="flex items-center">
                  <p className="text-xs text-gray-500">{activeConversation.phoneNumber}</p>
                  {isConnected ? (
                    <span className="text-xs text-green-500 flex items-center ml-2">
                      <span className="w-2 h-2 bg-green-500 rounded-full mr-1"></span>
                      Conectado
                    </span>
                  ) : (
                    <span className="text-xs text-red-500 flex items-center ml-2">
                      <span className="w-2 h-2 bg-red-500 rounded-full mr-1"></span>
                      Desconectado
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
          <div className="flex items-center">
            {lastRefresh && (
              <span className="text-xs text-gray-500 mr-3 hidden md:inline">
                Actualizado: {lastRefresh.toLocaleTimeString()}
              </span>
            )}
            <button 
              onClick={() => setShowContactInfo(true)}
              className="p-2 rounded-full hover:bg-purple-50 text-purple-600 transition-all mr-2"
              title="Información de contacto"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </button>
            <button 
              onClick={() => handleRefreshMessages()}
              className="p-2 rounded-full hover:bg-gray-100 text-gray-500"
              disabled={isLoadingMessages}
              title="Actualizar mensajes"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 ${isLoadingMessages ? 'animate-spin' : ''}`} viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        </div>
        
        {/* Messages - Contenedor mejorado para permitir desplazamiento correcto */}
        <div className="flex-1 bg-gray-100 p-4 overflow-y-auto message-container h-full">
          {isLoadingMessages ? (
            <div className="flex justify-center items-center h-full">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
            </div>
          ) : messages.length === 0 ? (
            <div className="flex justify-center items-center h-full">
              <p className="text-gray-500">No messages yet</p>
            </div>
          ) : (
            <div className="space-y-4 pb-2">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.direction === 'outgoing' ? 'justify-end' : 'justify-start'} message-enter message-enter-active`}
                >
                  <div
                    className={`max-w-[75%] rounded-lg px-4 py-2 shadow-sm ${
                      msg.direction === 'outgoing' 
                        ? 'bg-purple-600 text-white' 
                        : 'bg-white text-gray-800 border border-gray-200'
                    }`}
                  >
                    <p>{msg.message}</p>
                    <div className={`text-xs mt-1 ${msg.direction === 'outgoing' ? 'text-purple-200' : 'text-gray-500'}`}>
                      {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} className="h-4" /> {/* Espacio adicional al final para evitar que los mensajes se corten */}
            </div>
          )}
        </div>
        
        {/* Message Input - Mejorado con sombras y mejor espaciado */}
        <div className="bg-white border-t border-gray-200 p-4 shadow-md">
          {sendError && (
            <div className="mb-3 p-3 bg-red-50 text-red-600 text-sm rounded-lg shadow-sm">
              {sendError}
              <button 
                onClick={() => setSendError(null)} 
                className="ml-2 text-red-500 hover:text-red-700"
                aria-label="Dismiss error"
              >
                ×
              </button>
            </div>
          )}
          <form onSubmit={handleSendMessage} className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-2 sm:space-y-0 sm:space-x-2">
            <div className="flex-1 relative">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type a message..."
                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                disabled={isLoading}
              />
            </div>
            <button
              type="submit"
              className="bg-purple-600 text-white px-4 py-3 rounded-lg hover:bg-purple-700 transition-all hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed send-button flex justify-center items-center"
              disabled={isLoading || !newMessage.trim()}
              aria-label="Send message"
            >
              {isLoading ? (
                <span className="inline-block w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
              ) : (
                <span className="flex items-center">
                  <span className="mr-1 sm:inline hidden">Send</span>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </span>
              )}
            </button>
          </form>
        </div>
      </div>
      
      {/* Contact info panel - Mejorado para móvil */}
      {showContactInfo && (
        <div className={`${isMobile ? 'fixed inset-0 z-50 contact-info-mobile' : 'w-80 border-l h-full'} border-gray-200 bg-white overflow-hidden flex flex-col`}>
          <div className="flex justify-between items-center p-4 border-b border-gray-100 sticky top-0 bg-white z-10">
            <div className="flex items-center">
              <button 
                onClick={() => setShowContactInfo(false)}
                className="back-button mr-3 text-purple-600 hover:bg-purple-50 p-2 rounded-full"
                aria-label="Volver"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
                </svg>
              </button>
              <h3 className="text-lg font-medium text-gray-900">Información de contacto</h3>
            </div>
          
          </div>
          
          <div className="p-4 overflow-y-auto flex-1">
            <div className="flex flex-col items-center mb-6 p-4 bg-gradient-to-b from-purple-50 to-white rounded-lg">
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-white text-3xl font-medium mb-3 shadow-lg">
                {activeConversation.contact?.name?.[0]?.toUpperCase() || activeConversation.phoneNumber[0]}
              </div>
              <h4 className="text-xl font-medium text-gray-900">
                {activeConversation.contact?.name || 'Sin nombre'}
              </h4>
              <p className="text-gray-500">{activeConversation.phoneNumber}</p>
            </div>
            
            <div className="space-y-4 p-4 bg-white rounded-lg shadow-sm">
              <h5 className="text-sm font-medium text-gray-500 mb-3">Información de Contacto</h5>
              
              <div className="flex items-start">
                <div className="text-purple-500 mr-3 mt-0.5">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-800">Número de Teléfono</p>
                  <p className="text-sm text-gray-600">{activeConversation.phoneNumber}</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <div className="text-purple-500 mr-3 mt-0.5">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-800">Nombre</p>
                  <p className="text-sm text-gray-600">{activeConversation.contact?.name || 'Sin nombre'}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
