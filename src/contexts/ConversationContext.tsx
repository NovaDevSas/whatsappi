"use client";

import React, { createContext, useContext, useEffect, useState, useRef, useCallback } from 'react';
import { Conversation, Message } from '@/types';
import { useWebSocket } from './WebSocketContext';

interface ConversationContextType {
  conversations: Conversation[];
  activeConversation: Conversation | null;
  messages: Message[];
  setActiveConversation: (conversation: Conversation | null) => void;
  refreshConversations: () => Promise<void>;
  refreshMessages: () => Promise<void>;
  sendMessage: (phoneNumber: string, message: string) => Promise<boolean>;
}

const ConversationContext = createContext<ConversationContextType>({
  conversations: [],
  activeConversation: null,
  messages: [],
  setActiveConversation: () => {},
  refreshConversations: async () => {},
  refreshMessages: async () => {},
  sendMessage: async () => false,
});

export const useConversations = () => useContext(ConversationContext);

export const ConversationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversation, setActiveConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const { isConnected, lastMessage } = useWebSocket();
  
  // Memoized refresh functions to prevent unnecessary re-renders
  const refreshConversations = useCallback(async () => {
    try {
      const response = await fetch('/api/conversations');
      const data = await response.json();
      if (data.conversations) {
        setConversations(data.conversations);
      }
    } catch (error) {
      console.error('Error fetching conversations:', error);
    }
  }, []);

  // Fetch messages for active conversation
  const refreshMessages = useCallback(async () => {
    if (!activeConversation) return;
    
    try {
      const response = await fetch(`/api/conversations/${activeConversation.id}/messages`);
      const data = await response.json();
      if (data.messages) {
        setMessages(data.messages);
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  }, [activeConversation]);

  // Send a message
  const sendMessage = useCallback(async (phoneNumber: string, message: string): Promise<boolean> => {
    try {
      const response = await fetch('/api/send-message', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ phoneNumber, message }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to send message');
      }
      
      // No need to refresh as WebSocket will handle it
      return true;
    } catch (error) {
      console.error('Error sending message:', error);
      return false;
    }
  }, []);

  // Initial load of conversations
  useEffect(() => {
    refreshConversations();
  }, [refreshConversations]);

  // Load messages when active conversation changes
  useEffect(() => {
    if (activeConversation) {
      refreshMessages();
    } else {
      setMessages([]);
    }
  }, [activeConversation, refreshMessages]);

  // Handle new messages from WebSocket
  useEffect(() => {
    if (!lastMessage) return;
    
    // Update messages if the new message belongs to the active conversation
    if (activeConversation && lastMessage.phoneNumber === activeConversation.phoneNumber) {
      // Check if message already exists to avoid duplicates
      setMessages(prevMessages => {
        const messageExists = prevMessages.some(msg => msg.id === lastMessage.id);
        if (messageExists) {
          return prevMessages;
        }
        return [...prevMessages, lastMessage];
      });
    }
    
    // Update conversations list to reflect the new message
    // But do it with a small delay to avoid too many refreshes
    const debounceTimeout = setTimeout(() => {
      refreshConversations();
    }, 500);
    
    return () => clearTimeout(debounceTimeout);
  }, [lastMessage, activeConversation, refreshConversations]);

  // Log WebSocket connection status changes
  useEffect(() => {
    if (isConnected) {
      console.log('WebSocket connected - real-time updates active');
    } else {
      console.log('WebSocket disconnected - manual refresh may be needed');
    }
  }, [isConnected]);

  return (
    <ConversationContext.Provider
      value={{
        conversations,
        activeConversation,
        messages,
        setActiveConversation,
        refreshConversations,
        refreshMessages,
        sendMessage,
      }}
    >
      {children}
    </ConversationContext.Provider>
  );
};