import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { useConversations } from '@/contexts/ConversationContext';
import { formatPhoneNumber } from '@/lib/utils';
import ContactInfo from './ContactInfo'; // This import is correct if both files are in the same directory

export default function ChatPanel() {
  const { 
    selectedConversation, 
    messages, 
    loading, 
    error, 
    sendMessage 
  } = useConversations();
  
  const [newMessage, setNewMessage] = useState('');
  const [sendingMessage, setSendingMessage] = useState(false);
  const [sendError, setSendError] = useState<string | null>(null);
  const [showContactInfo, setShowContactInfo] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom when messages change
  useEffect(() => {
    // Only scroll if we have messages and they've loaded
    if (messages.length > 0 && !loading.messages) {
      scrollToBottom();
    }
  }, [messages, loading.messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedConversation || !newMessage.trim()) return;
    
    try {
      setSendingMessage(true);
      setSendError(null);
      
      const result = await sendMessage(selectedConversation.phoneNumber, newMessage);
      
      if (result.success) {
        setNewMessage(''); // Clear input after successful send
      } else {
        setSendError(result.error || 'Error al enviar el mensaje');
      }
    } catch (error) {
      console.error('Error en el manejador de envío de mensajes:', error);
      setSendError('Error al enviar el mensaje');
    } finally {
      setSendingMessage(false);
    }
  };

  // If no conversation is selected, show a placeholder
  if (!selectedConversation) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-gray-50 p-8">
        <div className="text-center">
          <div className="mb-4">
            <Image 
              src="/images/logonova.webp" 
              alt="Nova Dev Logo" 
              width={180} 
              height={180} 
              className="mx-auto"
            />
          </div>
          <h2 className="text-xl font-semibold text-gray-700 mb-2">Bienvenido a WhatsApp API Manager</h2>
          <p className="text-gray-500 max-w-md">
            Selecciona una conversación de la lista para ver los mensajes y comenzar a chatear.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex">
      <div className={`flex-1 flex flex-col ${showContactInfo ? 'hidden md:flex' : 'flex'}`}>
        {/* Chat header */}
        <div className="bg-white border-b border-gray-200 px-4 py-3 flex justify-between items-center">
          <div className="flex items-center">
            <div 
              className="w-10 h-10 rounded-full bg-purple-500 flex items-center justify-center text-white font-medium mr-3 cursor-pointer"
              onClick={() => setShowContactInfo(true)}
            >
              {selectedConversation.contact?.name?.[0]?.toUpperCase() || selectedConversation.phoneNumber[0]}
            </div>
            <div>
              <h2 className="font-medium text-gray-800">
                {selectedConversation.contact?.name || formatPhoneNumber(selectedConversation.phoneNumber)}
              </h2>
              <p className="text-xs text-gray-500">
                {loading.messages ? 'Cargando...' : messages.length > 0 ? 'En línea' : 'Toca para ver información de contacto'}
              </p>
            </div>
          </div>
          <button 
            onClick={() => setShowContactInfo(!showContactInfo)}
            className="p-2 rounded-full hover:bg-gray-100 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </button>
        </div>
        
        {/* Messages */}
        <div className="flex-1 bg-gray-100 p-4 overflow-y-auto">
          {loading.messages ? (
            <div className="flex justify-center items-center h-full">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
            </div>
          ) : error.messages ? (
            <div className="text-red-500 text-center p-4">{error.messages}</div>
          ) : messages.length === 0 ? (
            <div className="text-gray-500 text-center p-4">No hay mensajes aún</div>
          ) : (
            <div className="space-y-3">
              {messages.map((msg) => {
                // Ensure we're handling message correctly whether it's a string or an object
                const messageText = typeof msg.message === 'object' 
                  ? msg.message.text 
                  : msg.message;
                  
                return (
                  <div
                    key={msg.id}
                    className={`max-w-xs md:max-w-md lg:max-w-lg rounded-lg p-3 ${
                      msg.direction === 'outgoing'
                        ? 'ml-auto bg-purple-500 text-white'
                        : 'mr-auto bg-white text-gray-800'
                    }`}
                  >
                    <p>{messageText}</p>
                    <p className={`text-xs mt-1 text-right ${
                      msg.direction === 'outgoing' ? 'text-purple-100' : 'text-gray-500'
                    }`}>
                      {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>
        
        {/* Message input */}
        <div className="bg-white border-t border-gray-200 p-4">
          {sendError && (
            <div className="mb-2 text-sm text-red-500 p-2 bg-red-50 rounded">
              {sendError}
            </div>
          )}
          <form onSubmit={handleSendMessage} className="flex items-center">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Escribe un mensaje..."
              disabled={sendingMessage}
              className="flex-1 border border-gray-300 rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:bg-gray-100"
            />
            <button
              type="submit"
              disabled={!newMessage.trim() || sendingMessage}
              className={`ml-2 p-2 rounded-full ${
                !newMessage.trim() || sendingMessage
                  ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                  : 'bg-purple-500 text-white hover:bg-purple-600'
              }`}
            >
              {sendingMessage ? (
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-t-transparent border-white"></div>
              ) : (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.707l-3-3a1 1 0 00-1.414 0l-3 3a1 1 0 001.414 1.414L9 9.414V13a1 1 0 102 0V9.414l1.293 1.293a1 1 0 001.414-1.414z"
                    clipRule="evenodd"
                  />
                </svg>
              )}
            </button>
          </form>
        </div>
      </div>
      
      {/* Contact Info Panel - Visible on mobile when showContactInfo is true, always visible on desktop if true */}
      {showContactInfo && (
        <div className={`${showContactInfo ? 'block w-full md:w-80' : 'hidden'}`}>
          <ContactInfo 
            conversation={selectedConversation} 
            onClose={() => setShowContactInfo(false)} 
          />
        </div>
      )}
    </div>
  );
}