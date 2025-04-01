'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { Message } from '@/types';

interface WebSocketContextType {
  connected: boolean;
  lastMessage: Message | null;
}

const WebSocketContext = createContext<WebSocketContextType>({
  connected: false,
  lastMessage: null,
});

export function useWebSocket() {
  return useContext(WebSocketContext);
}

interface WebSocketProviderProps {
  children: ReactNode;
}

export function WebSocketProvider({ children }: WebSocketProviderProps) {
  const [connected, setConnected] = useState(false);
  const [lastMessage, setLastMessage] = useState<Message | null>(null);
  
  useEffect(() => {
    // In a real implementation, you would connect to your WebSocket server
    // For now, we'll simulate it with a timeout
    
    console.log('Connecting to WebSocket...');
    
    // Simulate connection delay
    const connectionTimeout = setTimeout(() => {
      console.log('WebSocket connected');
      setConnected(true);
      
      // Simulate receiving messages periodically
      const messageInterval = setInterval(() => {
        // Only simulate messages when connected
        if (Math.random() > 0.7) { // 30% chance of receiving a message
          const simulatedMessage: Message = {
            id: `ws_${Date.now()}`,
            phoneNumber: '+1234567890', // This would be a real phone number in production
            message: 'This is a simulated incoming message via WebSocket',
            timestamp: new Date().toISOString(),
            direction: 'incoming',
          };
          
          setLastMessage(simulatedMessage);
          
          // In a real app, you would dispatch an event or update your state management
          console.log('Received WebSocket message:', simulatedMessage);
        }
      }, 30000); // Check every 30 seconds
      
      return () => {
        clearInterval(messageInterval);
      };
    }, 2000);
    
    return () => {
      clearTimeout(connectionTimeout);
      console.log('WebSocket disconnected');
    };
  }, []);
  
  const value = {
    connected,
    lastMessage,
  };
  
  return (
    <WebSocketContext.Provider value={value}>
      {children}
    </WebSocketContext.Provider>
  );
}