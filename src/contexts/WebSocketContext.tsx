"use client";

import React, { createContext, useContext, useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { Message } from '@/types';

interface WebSocketContextType {
  socket: Socket | null;
  isConnected: boolean;
  lastMessage: Message | null;
}

const WebSocketContext = createContext<WebSocketContextType>({
  socket: null,
  isConnected: false,
  lastMessage: null,
});

export const useWebSocket = () => useContext(WebSocketContext);

export const WebSocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [lastMessage, setLastMessage] = useState<Message | null>(null);

  useEffect(() => {
    // Only connect on the client side
    if (typeof window === 'undefined') return;

    // Create socket connection
    const socketInstance = io();
    setSocket(socketInstance);

    // Set up event listeners
    socketInstance.on('connect', () => {
      console.log('Connected to WebSocket server');
      setIsConnected(true);
    });

    socketInstance.on('disconnect', () => {
      console.log('Disconnected from WebSocket server');
      setIsConnected(false);
    });

    socketInstance.on('new_message', (data) => {
      console.log('New message received via WebSocket:', data);
      
      // Convert the database message to our Message type
      const newMessage: Message = {
        id: data.message_wamid || data.id,
        phoneNumber: data.display_phone || '',
        message: data.text_body || '',
        timestamp: new Date(data.timestamp_unix * 1000).toISOString(),
        direction: data.direction === 'outbound' ? 'outgoing' : 'incoming',
      };
      
      setLastMessage(newMessage);
    });

    // Clean up on unmount
    return () => {
      socketInstance.disconnect();
    };
  }, []);

  return (
    <WebSocketContext.Provider value={{ socket, isConnected, lastMessage }}>
      {children}
    </WebSocketContext.Provider>
  );
};