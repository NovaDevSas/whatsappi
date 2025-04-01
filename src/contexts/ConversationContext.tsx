'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
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
  sendMessage: (phoneNumber: string, message: string) => Promise<{ success: boolean; error?: string }>;
  refreshConversations: () => void;
  refreshMessages: () => void;
}

const ConversationContext = createContext<ConversationContextType | undefined>(undefined);

export function useConversations() {
  const context = useContext(ConversationContext);
  if (context === undefined) {
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
    conversations: false,
    messages: false,
  });
  const [error, setError] = useState({
    conversations: null as string | null,
    messages: null as string | null,
  });
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [messageRefreshTrigger, setMessageRefreshTrigger] = useState(0);

  // Fetch conversations
  useEffect(() => {
    fetchConversations();
  }, [refreshTrigger]);

  // Fetch messages when selected conversation changes
  useEffect(() => {
    if (selectedConversation) {
      fetchMessages(selectedConversation.id);
    } else {
      setMessages([]);
    }
  }, [selectedConversation, messageRefreshTrigger]);

  const fetchConversations = async () => {
    try {
      setLoading(prev => ({ ...prev, conversations: true }));
      setError(prev => ({ ...prev, conversations: null }));
      
      const response = await fetch('/api/conversations');
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch conversations');
      }
      
      const data = await response.json();
      
      if (data.conversations && Array.isArray(data.conversations)) {
        setConversations(data.conversations);
        
        // If we have a selected conversation, update it with fresh data
        if (selectedConversation) {
          const updatedConversation = data.conversations.find(
            (c: Conversation) => c.id === selectedConversation.id
          );
          if (updatedConversation) {
            setSelectedConversation(updatedConversation);
          }
        }
      } else {
        console.warn('Unexpected response format:', data);
        setConversations([]);
      }
    } catch (err) {
      console.error('Error fetching conversations:', err);
      setError(prev => ({
        ...prev,
        conversations: err instanceof Error ? err.message : 'Failed to load conversations'
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
      
      if (data.messages && Array.isArray(data.messages)) {
        setMessages(data.messages);
      } else {
        console.warn('Unexpected response format:', data);
        setMessages([]);
      }
    } catch (err) {
      console.error('Error fetching messages:', err);
      setError(prev => ({
        ...prev,
        messages: err instanceof Error ? err.message : 'Failed to load messages'
      }));
    } finally {
      setLoading(prev => ({ ...prev, messages: false }));
    }
  };

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
      
      if (response.ok) {
        // Add the sent message to the UI immediately
        const newMessage: Message = {
          id: `temp_${Date.now()}`,
          phoneNumber,
          message,
          timestamp: new Date().toISOString(),
          direction: 'outgoing',
        };
        
        setMessages(prev => [...prev, newMessage]);
        
        // Refresh conversations to update last message
        refreshConversations();
        
        return { success: true };
      } else {
        return { success: false, error: data.error || 'Failed to send message' };
      }
    } catch (error) {
      console.error('Error sending message:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'An error occurred while sending the message' 
      };
    }
  };

  const selectConversation = (conversation: Conversation) => {
    setSelectedConversation(conversation);
  };

  const refreshConversations = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  const refreshMessages = () => {
    setMessageRefreshTrigger(prev => prev + 1);
  };

  const value = {
    conversations,
    selectedConversation,
    messages,
    loading,
    error,
    selectConversation,
    sendMessage,
    refreshConversations,
    refreshMessages,
  };

  return (
    <ConversationContext.Provider value={value}>
      {children}
    </ConversationContext.Provider>
  );
}