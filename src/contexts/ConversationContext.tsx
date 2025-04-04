"use client";

import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
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
  const { lastMessage } = useWebSocket();
  const refreshIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Fetch conversations from API
  const refreshConversations = async () => {
    try {
      const response = await fetch('/api/conversations');
      const data = await response.json();
      if (data.conversations) {
        setConversations(data.conversations);
      }
    } catch (error) {
      console.error('Error fetching conversations:', error);
    }
  };

  // Fetch messages for active conversation
  const refreshMessages = async () => {
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
  };

  // Send a message
  const sendMessage = async (phoneNumber: string, message: string): Promise<boolean> => {
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
      
      // Refresh messages after sending
      await refreshMessages();
      await refreshConversations();
      return true;
    } catch (error) {
      console.error('Error sending message:', error);
      return false;
    }
  };

  // Initial load of conversations
  useEffect(() => {
    refreshConversations();
  }, []);

  // Set up auto-refresh when active conversation changes
  useEffect(() => {
    // Clear any existing interval
    if (refreshIntervalRef.current) {
      clearInterval(refreshIntervalRef.current);
      refreshIntervalRef.current = null;
    }

    if (activeConversation) {
      // Initial refresh
      refreshMessages();
      
      // Set up auto-refresh every 10 seconds
      refreshIntervalRef.current = setInterval(() => {
        refreshMessages();
      }, 10000); // 10 seconds
    } else {
      setMessages([]);
    }

    // Cleanup function to clear interval when component unmounts or conversation changes
    return () => {
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
        refreshIntervalRef.current = null;
      }
    };
  }, [activeConversation]);

  // Handle new messages from WebSocket
  useEffect(() => {
    if (!lastMessage) return;
    
    // Update messages if the new message belongs to the active conversation
    if (activeConversation && lastMessage.phoneNumber === activeConversation.phoneNumber) {
      setMessages(prevMessages => [...prevMessages, lastMessage]);
    }
    
    // Refresh conversations to update the last message preview
    refreshConversations();
  }, [lastMessage, activeConversation]);

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