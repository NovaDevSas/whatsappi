"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { Message } from '@/types';

interface WebSocketContextType {
  socket: Socket | null;
  isConnected: boolean;
  lastMessage: Message | null;
  notificationsEnabled: boolean;
  toggleNotifications: () => void;
}

const WebSocketContext = createContext<WebSocketContextType>({
  socket: null,
  isConnected: false,
  lastMessage: null,
  notificationsEnabled: false,
  toggleNotifications: () => {},
});

export const useWebSocket = () => useContext(WebSocketContext);

export const WebSocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [lastMessage, setLastMessage] = useState<Message | null>(null);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission | null>(null);

  // Check if notifications are supported and get permission status
  useEffect(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      setNotificationPermission(Notification.permission);
      
      // If permission was already granted, enable notifications by default
      if (Notification.permission === 'granted') {
        setNotificationsEnabled(true);
      }
      
      console.log('Notification permission status:', Notification.permission);
    } else {
      console.log('Notifications are not supported in this browser');
    }
  }, []);

  // Function to request notification permission
  const requestNotificationPermission = useCallback(async () => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      try {
        console.log('Requesting notification permission...');
        const permission = await Notification.requestPermission();
        console.log('Permission response:', permission);
        setNotificationPermission(permission);
        return permission === 'granted';
      } catch (error) {
        console.error('Error requesting notification permission:', error);
        return false;
      }
    }
    return false;
  }, []);

  // Toggle notifications on/off
  const toggleNotifications = useCallback(async () => {
    console.log('Toggle notifications called, current state:', notificationsEnabled);
    
    if (!notificationsEnabled) {
      // If turning on notifications, check/request permission first
      if (notificationPermission !== 'granted') {
        const granted = await requestNotificationPermission();
        if (!granted) {
          console.log('Permission not granted, cannot enable notifications');
          return; // Don't enable if permission not granted
        }
      }
    }
    
    setNotificationsEnabled(prev => !prev);
    console.log('Notifications now:', !notificationsEnabled);
  }, [notificationsEnabled, notificationPermission, requestNotificationPermission]);

  // Show notification for new message
  const showNotification = useCallback((message: Message) => {
    console.log('Attempting to show notification:', message);
    console.log('Notifications enabled:', notificationsEnabled);
    console.log('Permission status:', notificationPermission);
    
    if (!notificationsEnabled || notificationPermission !== 'granted') {
      console.log('Cannot show notification: either disabled or no permission');
      return;
    }
    
    try {
      // Only show notifications for incoming messages
      if (message.direction !== 'incoming') {
        console.log('Not showing notification for outgoing message');
        return;
      }
      
      const title = `New message from ${message.phoneNumber}`;
      const options = {
        body: message.message,
        icon: '/favicon.ico', // You can replace with your app icon
        tag: `whatsappi-${message.phoneNumber}`, // Group notifications by sender
        timestamp: new Date(message.timestamp).getTime()
      };
      
      console.log('Creating notification with:', { title, options });
      const notification = new Notification(title, options);
      
      // Close notification after 5 seconds
      setTimeout(() => notification.close(), 5000);
      
      // Handle notification click
      notification.onclick = () => {
        window.focus();
        notification.close();
      };
      
      console.log('Notification created successfully');
    } catch (error) {
      console.error('Error showing notification:', error);
    }
  }, [notificationsEnabled, notificationPermission]);

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
      
      // Show notification for the new message
      showNotification(newMessage);
    });

    // Clean up on unmount
    return () => {
      socketInstance.disconnect();
    };
  }, [showNotification]);

  return (
    <WebSocketContext.Provider value={{ 
      socket, 
      isConnected, 
      lastMessage, 
      notificationsEnabled,
      toggleNotifications
    }}>
      {children}
    </WebSocketContext.Provider>
  );
};