'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { Message } from '@/types';

interface WebSocketContextType {
  connected: boolean;
  lastMessage: Message | null;
}

const WebSocketContext = createContext<WebSocketContextType | undefined>(undefined);

export function useWebSocket() {
  const context = useContext(WebSocketContext);
  if (!context) {
    throw new Error('useWebSocket must be used within a WebSocketProvider');
  }
  return context;
}

interface WebSocketProviderProps {
  children: ReactNode;
}

export function WebSocketProvider({ children }: WebSocketProviderProps) {
  const [connected, setConnected] = useState(false);
  const [lastMessage, setLastMessage] = useState<Message | null>(null);
  
  useEffect(() => {
    // En una implementación real, conectaríamos a un servidor WebSocket
    // Por ahora, simulamos con un timeout
    
    console.log('Conectando a WebSocket...');
    
    // Simulamos retraso de conexión
    const connectionTimeout = setTimeout(() => {
      console.log('WebSocket conectado');
      setConnected(true);
      
      // Simulamos recibir mensajes periódicamente
      // En una implementación real, esto sería manejado por eventos del WebSocket
      const messageInterval = setInterval(() => {
        // Simulamos una probabilidad baja de recibir un mensaje
        if (Math.random() < 0.1) {
          const simulatedMessage: Message = {
            id: `sim-${Date.now()}`,
            phoneNumber: '573002839317', // Número de teléfono de ejemplo
            message: 'Este es un mensaje simulado recibido a través de WebSocket',
            timestamp: new Date().toISOString(),
            direction: 'incoming',
          };
          
          console.log('Mensaje recibido vía WebSocket:', simulatedMessage);
          setLastMessage(simulatedMessage);
        }
      }, 10000); // Verificar cada 10 segundos
      
      return () => {
        clearInterval(messageInterval);
        console.log('WebSocket desconectado');
      };
    }, 1500);
    
    return () => {
      clearTimeout(connectionTimeout);
    };
  }, []);
  
  return (
    <WebSocketContext.Provider value={{ connected, lastMessage }}>
      {children}
    </WebSocketContext.Provider>
  );
}