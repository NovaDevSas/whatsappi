import { useState, useEffect } from 'react';
import Sidebar from './Sidebar';
import ConversationPanel from './ConversationPanel';
import ChatPanel from './ChatPanel';
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
  
  // Listen for new messages via WebSocket
  useEffect(() => {
    if (lastMessage && selectedConversation && lastMessage.phoneNumber === selectedConversation.phoneNumber) {
      // If we receive a message for the currently selected conversation,
      // trigger a refresh of the messages
      refreshMessages();
    }
  }, [lastMessage, selectedConversation, refreshMessages]);

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
        {activeView === 'dashboard' && (
          <div className="p-6 flex-1 overflow-y-auto">
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
              <p className="text-gray-600">Bienvenido a tu dashboard de WhatsApp API</p>
            </div>
            
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <StatCard 
                title="Chats Activos" 
                value="24" 
                icon={<MessageIcon />} 
                color="bg-amber-100 text-amber-600" 
              />
              <StatCard 
                title="Mensajes Totales" 
                value="5620" 
                icon={<SendIcon />} 
                color="bg-green-100 text-green-600" 
              />
              <StatCard 
                title="Contactos" 
                value="850" 
                icon={<UserIcon />} 
                color="bg-blue-100 text-blue-600" 
              />
            </div>
            
            {/* Recent Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-lg font-medium mb-4">Últimos Chats</h2>
                <div className="space-y-4">
                  <RecentChat 
                    name="Sebastian Quintero" 
                    email="+573165351957" 
                    time="10:24" 
                    status="Online" 
                  />
                  <RecentChat 
                    name="Faby" 
                    email="+573002839317" 
                    time="14:58" 
                    status="Offline" 
                  />
                </div>
              </div>
              
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-lg font-medium mb-4">Estadísticas</h2>
                <div className="h-64 flex items-center justify-center">
                  <p className="text-gray-500">El gráfico de volumen de mensajes aparecerá aquí</p>
                </div>
              </div>
            </div>
            
            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-lg font-medium mb-4">Tipos de Mensajes</h2>
                <div className="h-64 flex items-center justify-center">
                  <div className="w-48 h-48 relative rounded-full overflow-hidden bg-gray-100">
                    <div className="absolute inset-0" style={{ 
                      background: 'conic-gradient(#4338ca 0% 25%, #0ea5e9 25% 55%, #f59e0b 55% 100%)' 
                    }}></div>
                    <div className="absolute inset-4 bg-white rounded-full flex items-center justify-center">
                      <span className="text-sm font-medium">Tipos de Mensajes</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-lg font-medium mb-4">Volumen de Mensajes</h2>
                <div className="h-64 flex items-center justify-center relative">
                  <div className="w-full h-32 relative">
                    <div className="absolute bottom-0 left-0 right-0 h-24" style={{
                      background: 'linear-gradient(to top, rgba(79, 70, 229, 0.2) 0%, transparent 100%)'
                    }}></div>
                    <div className="absolute bottom-0 left-0 right-0 h-px bg-indigo-500"></div>
                    <div className="absolute bottom-0 left-0 right-0 h-24 flex items-end">
                      <div style={{ 
                        height: '40%', 
                        width: '100%',
                        backgroundImage: 'linear-gradient(90deg, #4f46e5 0%, #0ea5e9 50%, #4f46e5 100%)',
                        clipPath: 'path("M0,100 C150,30 350,70 500,20 L500,100 L0,100 Z")',
                      }}></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
        
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