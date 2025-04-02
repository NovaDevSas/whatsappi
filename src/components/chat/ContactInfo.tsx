import { useState } from 'react';
import { Conversation } from '@/types';
import { formatPhoneNumber } from '@/lib/utils';

interface ContactInfoProps {
  conversation: Conversation | null;
  onClose?: () => void;
}

export default function ContactInfo({ conversation, onClose }: ContactInfoProps) {
  const [showOptions, setShowOptions] = useState(false);
  
  if (!conversation) return null;
  
  const name = conversation.contact?.name || 'Sin nombre';
  const phoneNumber = conversation.phoneNumber;
  const formattedPhone = formatPhoneNumber(phoneNumber);
  
  // Usar lastMessage.timestamp si lastMessageTime no está disponible
  const lastActivity = conversation.lastMessageTime 
    ? new Date(conversation.lastMessageTime).toLocaleString()
    : conversation.lastMessage?.timestamp 
      ? new Date(conversation.lastMessage.timestamp).toLocaleString()
      : 'No disponible';
  
  // Obtener la inicial para el avatar
  const initial = name[0]?.toUpperCase() || 'S';
  
  return (
    <div className="h-full bg-white rounded-l-2xl shadow-lg overflow-y-auto">
      {/* Header con botón de cierre */}
      <div className="flex justify-between items-center p-4 border-b border-gray-100">
        <h2 className="text-lg font-semibold text-gray-800">Información de contacto</h2>
        {onClose && (
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>
      
      {/* Perfil principal - Eliminado el indicador de en línea */}
      <div className="flex flex-col items-center p-8 bg-gradient-to-b from-purple-50 to-white">
        <div className="mb-4">
          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-white text-4xl font-semibold shadow-lg">
            {initial}
          </div>
        </div>
        
        <h1 className="text-2xl font-bold text-gray-800 mb-1">{name}</h1>
        <p className="text-gray-600 mb-4">{formattedPhone}</p>
        
        {/* Removed the options button completely */}
      </div>
      
      {/* Información detallada */}
      <div className="p-6">
        <div className="mb-6">
          <h3 className="text-sm font-medium text-gray-500 mb-3">Información de Contacto</h3>
          
          <div className="space-y-4">
            <div className="flex items-start">
              <div className="text-purple-500 mr-3 mt-0.5">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-800">Número de Teléfono</p>
                <p className="text-sm text-gray-600">{formattedPhone}</p>
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
                <p className="text-sm text-gray-600">{name}</p>
              </div>
            </div>
            
            <div className="flex items-start">
              <div className="text-purple-500 mr-3 mt-0.5">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-800">Última Actividad</p>
                <p className="text-sm text-gray-600">{lastActivity}</p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Acciones adicionales */}
        <div className="space-y-2">
          <button className="w-full py-2.5 px-4 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition-colors flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
            </svg>
            Bloquear contacto
          </button>
        </div>
      </div>
    </div>
  );
}