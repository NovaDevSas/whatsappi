import { useState, useEffect, useCallback } from 'react';
import Sidebar from '../layout/Sidebar';
import ConversationPanel from '../conversation/ConversationPanel';
import ChatPanel from '../chat/ChatPanel';
import Dashboard from '../dashboard/Dashboard';
import { useWebSocket } from '@/contexts/WebSocketContext';
import { useConversations } from '@/contexts/ConversationContext';

// Componentes auxiliares para el Dashboard
const StatCard = ({ title, value, icon, color }) => (
  <div className="bg-white rounded-lg shadow p-6 flex items-center">
    <div className={`w-12 h-12 rounded-full ${color} flex items-center justify-center mr-4`}>
      {icon}
    </div>
    <div>
      <p className="text-sm text-gray-500">{title}</p>
      <p className="text-2xl font-bold">{value}</p>
    </div>
  </div>
);

// Otros componentes auxiliares (MessageIcon, SendIcon, UserIcon, RecentChat)
const MessageIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
  </svg>
);

const SendIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
  </svg>
);

const UserIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
  </svg>
);

const RecentChat = ({ name, email, time, status }) => (
  <div className="flex items-center justify-between">
    <div className="flex items-center">
      <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 font-medium mr-3">
        {name[0]}
      </div>
      <div>
        <p className="text-sm font-medium">{name}</p>
        <p className="text-xs text-gray-500">{email}</p>
      </div>
    </div>
    <div className="text-right">
      <p className="text-xs text-gray-500">{time}</p>
      <p className="text-xs text-green-500">{status}</p>
    </div>
  </div>
);

export default function ChatLayout() {
  const [activeView, setActiveView] = useState<'chat' | 'dashboard'>('dashboard');
  const { connected, lastMessage } = useWebSocket();
  const { selectedConversation, selectConversation, refreshMessages } = useConversations();
  
  // Memoize refreshMessages to avoid recreating it on every render
  const memoizedRefreshMessages = useCallback(() => {
    if (selectedConversation) {
      refreshMessages();
    }
  }, [selectedConversation, refreshMessages]);
  
  // Effect for handling conversation selection
  useEffect(() => {
    if (selectedConversation) {
      memoizedRefreshMessages();
    }
  }, [selectedConversation, memoizedRefreshMessages]);
  
  // Listen for new messages via WebSocket
  useEffect(() => {
    if (lastMessage && selectedConversation && lastMessage.phoneNumber === selectedConversation.phoneNumber) {
      // Add a check to prevent excessive refreshes
      const messageTimestamp = new Date(lastMessage.timestamp).getTime();
      const currentTime = Date.now();
      const isRecentMessage = (currentTime - messageTimestamp) < 10000; // Only refresh for messages less than 10 seconds old
      
      if (isRecentMessage) {
        memoizedRefreshMessages();
      }
    }
  }, [lastMessage, selectedConversation, memoizedRefreshMessages]);

  return (
    <div className="flex h-screen bg-purple-50">
      {/* Sidebar */}
      <Sidebar activeView={activeView} onViewChange={setActiveView} />
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* WebSocket Connection Status */}
        {!connected && (
          <div className="bg-yellow-100 text-yellow-800 px-4 py-2 text-sm">
            Connecting to server for real-time updates...
          </div>
        )}
        
        {/* Dashboard View */}
        {activeView === 'dashboard' && <Dashboard />}
        
        {/* Chat View */}
        {activeView === 'chat' && (
          <div className="flex-1 flex overflow-hidden">
            <ConversationPanel />
            <ChatPanel />
          </div>
        )}
      </div>
    </div>
  );
}