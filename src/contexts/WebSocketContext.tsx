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
  connectionStatus?: 'connected' | 'disconnected' | 'connecting';
  reconnect: () => void;
  lastActivity: Date | null;
}

const WebSocketContext = createContext<WebSocketContextType>({
  socket: null,
  isConnected: false,
  lastMessage: null,
  notificationsEnabled: false,
  toggleNotifications: () => {},
  connectionStatus: 'disconnected',
  reconnect: () => {},
  lastActivity: null,
});

export const useWebSocket = () => useContext(WebSocketContext);

export const WebSocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [lastMessage, setLastMessage] = useState<Message | null>(null);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<'connected' | 'disconnected' | 'connecting'>('disconnected');
  const [lastActivity, setLastActivity] = useState<Date | null>(null);
  
  // Function to reconnect the socket
  const reconnect = useCallback(() => {
    if (socket) {
      console.log('Attempting to reconnect WebSocket...');
      setConnectionStatus('connecting');
      
      // Close existing connection
      socket.close();
      
      // Create new connection
      const newSocket = io();
      setSocket(newSocket);
      
      // Set up event listeners for the new socket
      newSocket.on('connect', () => {
        console.log('Reconnected to WebSocket server');
        setIsConnected(true);
        setConnectionStatus('connected');
        setLastActivity(new Date());
      });
      
      newSocket.on('disconnect', () => {
        console.log('Disconnected from WebSocket server');
        setIsConnected(false);
        setConnectionStatus('disconnected');
      });
    }
  }, [socket]);

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
      setLastActivity(new Date());
      
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
    
    // Handle pong responses to track activity
    socketInstance.on('pong', () => {
      setLastActivity(new Date());
    });

    // Clean up on unmount
    return () => {
      socketInstance.disconnect();
    };
  }, [showNotification]);
  
  // Auto-reconnect on network status change
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const handleOnline = () => {
      console.log('Network is online, attempting to reconnect');
      if (!isConnected) {
        reconnect();
      }
    };
    
    window.addEventListener('online', handleOnline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
    };
  }, [isConnected, reconnect]);

  // Ping server periodically to keep connection alive
  useEffect(() => {
    if (!socket || !isConnected) return;
    
    const pingInterval = setInterval(() => {
      socket.emit('ping', { timestamp: new Date().toISOString() });
    }, 30000); // Every 30 seconds
    
    return () => clearInterval(pingInterval);
  }, [socket, isConnected]);
  
  // Monitor for inactivity and reconnect if needed
  useEffect(() => {
    if (!socket) return;
    
    const checkActivity = setInterval(() => {
      if (lastActivity) {
        const inactiveTime = Date.now() - lastActivity.getTime();
        if (inactiveTime > 120000 && !isConnected) { // 2 minutes
          console.log('Connection inactive for too long, attempting reconnect');
          reconnect();
        }
      }
    }, 60000); // Check every minute
    
    return () => clearInterval(checkActivity);
  }, [socket, lastActivity, isConnected, reconnect]);

  return (
    <WebSocketContext.Provider
      value={{
        socket,
        isConnected,
        lastMessage,
        notificationsEnabled,
        toggleNotifications,
        connectionStatus,
        reconnect,
        lastActivity,
      }}
    >
      {children}
    </WebSocketContext.Provider>
  );
};