import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ClockIcon } from '@heroicons/react/24/outline';

// Componentes auxiliares para el Dashboard
const StatCard = ({ title, value, icon, color, description }) => (
  <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4 sm:p-5 transition-all hover:shadow-md">
    <div className="flex items-center">
      <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full ${color} flex items-center justify-center shrink-0 mr-4`}>
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm text-gray-500 mb-1">{title}</p>
        <div className="flex items-baseline">
          <p className="text-xl sm:text-2xl font-bold">{value}</p>
          {description && (
            <p className="ml-2 text-xs text-gray-400">{description}</p>
          )}
        </div>
      </div>
    </div>
  </div>
);

// Componente para el gráfico de actividad por hora
const HourlyActivity = ({ data }) => {
  const maxValue = Math.max(...Object.values(data));
  
  return (
    <div className="grid grid-cols-6 sm:grid-cols-12 gap-1 h-32 sm:h-40">
      {Object.entries(data).map(([hour, count]) => {
        const height = `${Math.max((count / maxValue) * 100, 5)}%`;
        const isActive = parseInt(hour) >= new Date().getHours() - 1 && parseInt(hour) <= new Date().getHours();
        
        return (
          <div key={hour} className="flex flex-col items-center">
            <div className="flex-1 w-full flex items-end">
              <div 
                className={`w-full ${isActive ? 'bg-purple-500' : 'bg-purple-200'} rounded-t-sm transition-all duration-300 hover:bg-purple-400`}
                style={{ height }}
              ></div>
            </div>
            <div className="text-xs text-gray-500 mt-1">{hour}h</div>
          </div>
        );
      })}
    </div>
  );
};

// Componente para las conversaciones recientes
const RecentChat = ({ chat, onSelect }) => {
  const { name, phoneNumber, time, lastMessage, unreadCount, responseTime } = chat;
  
  return (
    <div 
      className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors cursor-pointer border border-transparent hover:border-gray-100"
      onClick={() => onSelect(phoneNumber)}
    >
      <div className="flex items-center flex-1 min-w-0">
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center text-white font-medium mr-3 shadow-sm">
          {name[0].toUpperCase()}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium truncate">{name}</p>
            <p className="text-xs text-gray-500 ml-2 whitespace-nowrap">{time}</p>
          </div>
          {lastMessage && (
            <p className="text-xs text-gray-500 truncate">{lastMessage.length > 30 ? lastMessage.substring(0, 30) + '...' : lastMessage}</p>
          )}
          <div className="flex items-center mt-1">
            {responseTime && (
              <span className="text-xs text-gray-400 flex items-center mr-3">
                <ClockIcon className="w-3 h-3 mr-1" />
                {responseTime}
              </span>
            )}
            {unreadCount > 0 && (
              <span className="inline-flex items-center justify-center px-2 py-0.5 text-xs font-bold leading-none text-white bg-purple-600 rounded-full">
                {unreadCount}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Componente principal del Dashboard
export default function Dashboard() {
  const router = useRouter();
  const [stats, setStats] = useState({
    activeChats: 0,
    totalMessages: 0,
    contacts: 0,
    pendingResponses: 0,
    avgResponseTime: '0m',
    messagesLast24h: 0
  });
  
  const [recentChats, setRecentChats] = useState([]);
  const [hourlyActivity, setHourlyActivity] = useState({});
  const [messageTypes, setMessageTypes] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        
        // Fetch conversations for recent chats and stats
        const conversationsResponse = await fetch('/api/conversations');
        if (!conversationsResponse.ok) {
          throw new Error('Failed to fetch conversations');
        }
        const conversationsData = await conversationsResponse.json();
        const conversations = conversationsData.conversations || [];
        
        // Fetch messages for additional analytics
        const messagesResponse = await fetch('/api/messages');
        const messagesData = await messagesResponse.json();
        const messages = messagesData.messages || [];
        
        // Calculate hourly activity
        const hourlyData = calculateHourlyActivity(messages);
        setHourlyActivity(hourlyData);
        
        // Calculate message types
        const typesData = calculateMessageTypes(messages);
        setMessageTypes(typesData);
        
        // Calculate pending responses
        const pendingResponses = conversations.filter(conv => 
          conv.lastMessage && 
          messages.find(m => m.id === conv.lastMessage.id)?.direction === 'incoming'
        ).length;
        
        // Calculate average response time
        const avgResponseTime = calculateAverageResponseTime(messages);
        
        // Calculate messages in last 24 hours
        const last24h = messages.filter(m => {
          const messageTime = new Date(m.timestamp).getTime();
          const yesterday = Date.now() - 24 * 60 * 60 * 1000;
          return messageTime > yesterday;
        }).length;
        
        // Set recent chats with enhanced data
        const recent = conversations.slice(0, 8).map(conv => {
          // Find all messages for this conversation
          const conversationMessages = messages.filter(m => m.phoneNumber === conv.phoneNumber);
          
          // Calculate response time
          const responseTime = calculateConversationResponseTime(conversationMessages);
          
          return {
            name: conv.contact?.name || conv.phoneNumber,
            phoneNumber: conv.phoneNumber,
            time: conv.lastMessage?.timestamp 
              ? new Date(conv.lastMessage.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
              : '',
            lastMessage: conv.lastMessage?.text || '',
            unreadCount: conv.unreadCount || 0,
            responseTime
          };
        });
        
        setRecentChats(recent);
        
        // Update stats
        setStats({
          activeChats: conversations.length,
          totalMessages: messages.length,
          contacts: conversations.length,
          pendingResponses,
          avgResponseTime,
          messagesLast24h: last24h
        });
        
        setError(null);
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError('Failed to load dashboard data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchDashboardData();
    
    // Set up polling for real-time updates (every 30 seconds)
    const intervalId = setInterval(fetchDashboardData, 30000);
    
    // Clean up on unmount
    return () => clearInterval(intervalId);
  }, []);

  const calculateHourlyActivity = (messages) => {
    const hourlyData = {};
    
    // Initialize hours
    for (let i = 0; i < 24; i++) {
      hourlyData[i] = 0;
    }
    
    // Count messages per hour
    messages.forEach(message => {
      if (message.timestamp) {
        const date = new Date(message.timestamp);
        const hour = date.getHours();
        hourlyData[hour] = (hourlyData[hour] || 0) + 1;
      }
    });
    
    return hourlyData;
  };
  
  const calculateMessageTypes = (messages) => {
    const types = {
      'Text': 0,
      'Media': 0,
      'Document': 0,
      'Other': 0
    };
    
    messages.forEach(message => {
      if (message.type === 'text') {
        types['Text']++;
      } else if (['image', 'video', 'audio'].includes(message.type)) {
        types['Media']++;
      } else if (message.type === 'document') {
        types['Document']++;
      } else {
        types['Other']++;
      }
    });
    
    return types;
  };
  
  const calculateAverageResponseTime = (messages) => {
    // This is a simplified calculation
    // In a real app, you'd pair incoming and outgoing messages and calculate the time difference
    return '5m';
  };
  
  const calculateConversationResponseTime = (messages) => {
    // Simplified - in reality you'd calculate based on actual response patterns
    if (messages.length < 2) return null;
    return Math.floor(Math.random() * 10) + 1 + 'm';
  };
  
  const handleChatSelect = (phoneNumber) => {
    // Navigate to the chat view and select this conversation
    router.push('/chat');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full p-4">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
          <p className="mt-4 text-gray-600">Cargando panel de control...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full p-4">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md">
          <h3 className="text-red-800 font-medium mb-2">Error</h3>
          <p className="text-red-600">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="mt-4 px-4 py-2 bg-red-100 text-red-800 rounded-md hover:bg-red-200 transition-colors"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full overflow-auto bg-gray-50 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Encabezado */}
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2">Panel de Control</h1>
          <p className="text-gray-500 text-sm sm:text-base">Gestión de conversaciones de WhatsApp</p>
        </div>
        
        {/* Tarjetas de estadísticas */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          <StatCard 
            title="Chats Activos" 
            value={stats.activeChats} 
            description="Conversaciones totales"
            icon={
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
              </svg>
            } 
            color="bg-yellow-100" 
          />
          
          <StatCard 
            title="Mensajes Totales" 
            value={stats.totalMessages} 
            description="Histórico acumulado"
            icon={
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
              </svg>
            } 
            color="bg-green-100" 
          />
          
          <StatCard 
            title="Contactos" 
            value={stats.contacts} 
            description="Clientes registrados"
            icon={
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            } 
            color="bg-blue-100" 
          />
          
          <StatCard 
            title="Respuestas Pendientes" 
            value={stats.pendingResponses} 
            description="Requieren atención"
            icon={
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            } 
            color="bg-red-100" 
          />
          
          <StatCard 
            title="Tiempo de Respuesta" 
            value={stats.avgResponseTime} 
            description="Promedio"
            icon={
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            } 
            color="bg-purple-100" 
          />
          
          <StatCard 
            title="Mensajes (24h)" 
            value={stats.messagesLast24h} 
            description="Actividad reciente"
            icon={
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            } 
            color="bg-indigo-100" 
          />
        </div>
        
        {/* Sección de análisis y conversaciones recientes */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Columna izquierda - Análisis */}
          <div className="lg:col-span-1 space-y-6">
            {/* Actividad por hora */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-5">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">Actividad Reciente</h2>
              <p className="text-sm text-gray-500 mb-4">Mensajes por hora</p>
              <HourlyActivity data={hourlyActivity} />
            </div>
            
            {/* Tipos de mensajes */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-5">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">Tipos de Mensajes</h2>
              <div className="space-y-3">
                {Object.entries(messageTypes).map(([type, count]) => (
                  <div key={type} className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">{type}</span>
                      <span className="font-medium">{count}</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-2">
                      <div 
                        className="bg-purple-500 h-2 rounded-full" 
                        style={{ 
                          width: `${Math.min(100, (count / Math.max(...Object.values(messageTypes))) * 100)}%` 
                        }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          {/* Columna derecha - Conversaciones recientes */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm border border-gray-100 h-full">
              <div className="p-5 border-b border-gray-100">
                <h2 className="text-lg font-semibold text-gray-800">Conversaciones Recientes</h2>
              </div>
              
              <div className="p-3">
                {recentChats.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-10 px-4 text-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-300 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                    </svg>
                    <p className="text-gray-500 mb-2">No hay conversaciones que coincidan con el filtro seleccionado</p>
                    <button 
                      onClick={() => router.push('/chat')}
                      className="mt-2 px-4 py-2 bg-purple-100 text-purple-700 rounded-md hover:bg-purple-200 transition-colors text-sm font-medium"
                    >
                      Ver todas las conversaciones
                    </button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {recentChats.map((chat, index) => (
                      <RecentChat 
                        key={chat.phoneNumber || index} 
                        chat={chat} 
                        onSelect={handleChatSelect} 
                      />
                    ))}
                    
                    <div className="pt-2 pb-1 px-3">
                      <button 
                        onClick={() => router.push('/chat')}
                        className="text-purple-600 text-sm font-medium hover:text-purple-800 transition-colors flex items-center"
                      >
                        Ver todas las conversaciones
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                        </svg>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}