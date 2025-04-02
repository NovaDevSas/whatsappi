'use client';

import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { Conversation, Message } from '@/types';

interface ConversationContextType {
  conversations: Conversation[];
  selectedConversation: Conversation | null;
  messages: Message[];
  loading: {
    conversations: boolean;
    messages: boolean;
  };
  error: {
    conversations: string | null;
    messages: string | null;
  };
  selectConversation: (conversation: Conversation) => void;
  refreshConversations: () => Promise<void>;
  refreshMessages: () => Promise<void>;
  sendMessage: (phoneNumber: string, message: string) => Promise<{ success: boolean; error?: string }>;
}

const ConversationContext = createContext<ConversationContextType | undefined>(undefined);

export function useConversations() {
  const context = useContext(ConversationContext);
  if (!context) {
    throw new Error('useConversations must be used within a ConversationProvider');
  }
  return context;
}

interface ConversationProviderProps {
  children: ReactNode;
}

export function ConversationProvider({ children }: ConversationProviderProps) {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState({
    conversations: true,
    messages: false,
  });
  const [error, setError] = useState({
    conversations: null as string | null,
    messages: null as string | null,
  });

  // Fetch conversations on initial load
  useEffect(() => {
    refreshConversations();
  }, []);

  // Fetch messages when a conversation is selected
  useEffect(() => {
    if (selectedConversation) {
      refreshMessages();
    } else {
      setMessages([]);
    }
  }, [selectedConversation]);

  const selectConversation = (conversation: Conversation) => {
    setSelectedConversation(conversation);
  };

  const refreshConversations = async () => {
    try {
      setLoading(prev => ({ ...prev, conversations: true }));
      setError(prev => ({ ...prev, conversations: null }));
      
      const response = await fetch('/api/conversations');
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch conversations');
      }
      
      const data = await response.json();
      setConversations(data.conversations);
      
      // If the selected conversation exists, update it with fresh data
      if (selectedConversation) {
        const updatedConversation = data.conversations.find(
          (c: Conversation) => c.id === selectedConversation.id
        );
        
        if (updatedConversation) {
          setSelectedConversation(updatedConversation);
        }
      }
    } catch (error) {
      console.error('Error fetching conversations:', error);
      setError(prev => ({ 
        ...prev, 
        conversations: error instanceof Error ? error.message : 'Failed to fetch conversations' 
      }));
    } finally {
      setLoading(prev => ({ ...prev, conversations: false }));
    }
  };

  const fetchMessages = async (conversationId: string) => {
    try {
      setLoading(prev => ({ ...prev, messages: true }));
      setError(prev => ({ ...prev, messages: null }));
      
      const response = await fetch(`/api/conversations/${conversationId}/messages`);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch messages');
      }
      
      const data = await response.json();
      setMessages(data.messages || []);
      return data.messages;
    } catch (error) {
      console.error('Error fetching messages:', error);
      setError(prev => ({ 
        ...prev, 
        messages: error instanceof Error ? error.message : 'Failed to fetch messages' 
      }));
      return [];
    } finally {
      setLoading(prev => ({ ...prev, messages: false }));
    }
  };

  // Fix the refreshMessages implementation with useCallback
  const refreshMessages = useCallback(async () => {
    if (selectedConversation) {
      await fetchMessages(selectedConversation.id);
    }
  }, [selectedConversation]);

  const sendMessage = async (phoneNumber: string, message: string) => {
    try {
      const response = await fetch('/api/send-message', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ phoneNumber, message }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        return { 
          success: false, 
          error: data.error || 'Failed to send message' 
        };
      }
      
      // Refresh messages after sending
      await refreshMessages();
      
      // Also refresh conversations to update last message
      await refreshConversations();
      
      return { success: true };
    } catch (error) {
      console.error('Error sending message:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to send message' 
      };
    }
  };

  const value = {
    conversations,
    selectedConversation,
    messages,
    loading,
    error,
    selectConversation,
    refreshConversations,
    refreshMessages,
    sendMessage,
  };

  return (
    <ConversationContext.Provider value={value}>
      {children}
    </ConversationContext.Provider>
  );
}