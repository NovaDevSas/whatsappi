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
  
  // Format hours in a more readable way
  const formatHour = (hour) => {
    const hourNum = parseInt(hour);
    return hourNum < 10 ? `${hourNum}h` : `${hourNum}h`;
  };
  
  // Group hours into more manageable chunks
  const renderHourGroups = () => {
    const hours = Object.entries(data);
    
    // Create groups of hours (0-11 for AM, 12-23 for PM)
    const amHours = hours.filter(([hour]) => parseInt(hour) < 12);
    const pmHours = hours.filter(([hour]) => parseInt(hour) >= 12);
    
    return (
      <>
        <div className="grid grid-cols-12 gap-1 h-28 mb-1">
          {amHours.map(([hour, count]) => {
            const height = `${Math.max((count / maxValue) * 100, 5)}%`;
            const isActive = parseInt(hour) === new Date().getHours();
            
            return (
              <div key={hour} className="flex flex-col items-center">
                <div className="flex-1 w-full flex items-end">
                  <div 
                    className={`w-full ${isActive ? 'bg-purple-500' : 'bg-purple-200'} rounded-t-sm transition-all duration-300 hover:bg-purple-400`}
                    style={{ height }}
                    title={`${count} mensajes a las ${hour}:00`}
                  ></div>
                </div>
              </div>
            );
          })}
        </div>
        
        <div className="grid grid-cols-12 gap-1 mb-2">
          {amHours.map(([hour]) => (
            <div key={hour} className="text-xs text-center text-gray-500">
              {hour}h
            </div>
          ))}
        </div>
        
        <div className="grid grid-cols-12 gap-1 h-28 mb-1">
          {pmHours.map(([hour, count]) => {
            const height = `${Math.max((count / maxValue) * 100, 5)}%`;
            const isActive = parseInt(hour) === new Date().getHours();
            
            return (
              <div key={hour} className="flex flex-col items-center">
                <div className="flex-1 w-full flex items-end">
                  <div 
                    className={`w-full ${isActive ? 'bg-purple-500' : 'bg-purple-200'} rounded-t-sm transition-all duration-300 hover:bg-purple-400`}
                    style={{ height }}
                    title={`${count} mensajes a las ${hour}:00`}
                  ></div>
                </div>
              </div>
            );
          })}
        </div>
        
        <div className="grid grid-cols-12 gap-1">
          {pmHours.map(([hour]) => (
            <div key={hour} className="text-xs text-center text-gray-500">
              {parseInt(hour) - 12}h
            </div>
          ))}
        </div>
      </>
    );
  };
  
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-1">
        <span className="text-xs font-medium text-gray-500">AM</span>
        <span className="text-xs font-medium text-gray-500">Mañana</span>
      </div>
      
      {renderHourGroups()}
      
      <div className="flex justify-between items-center mt-1">
        <span className="text-xs font-medium text-gray-500">PM</span>
        <span className="text-xs font-medium text-gray-500">Tarde/Noche</span>
      </div>
      
      <div className="mt-6 pt-4 border-t border-gray-100">
        <h3 className="text-sm font-medium text-gray-700 mb-2">Horas pico</h3>
        <div className="flex flex-wrap gap-2">
          {Object.entries(data)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 3)
            .map(([hour, count]) => {
              const hourNum = parseInt(hour);
              const formattedHour = hourNum < 12 
                ? `${hourNum === 0 ? '12:00' : hourNum + ':00'} AM` 
                : `${hourNum === 12 ? '12:00' : (hourNum - 12) + ':00'} PM`;
              
              return (
                <div key={hour} className="bg-purple-50 text-purple-700 text-xs px-2 py-1 rounded-full">
                  {formattedHour}
                </div>
              );
            })
          }
        </div>
      </div>
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

// Componente para el panel de información
const InfoPanel = ({ stats }) => (
  <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-5">
    <h2 className="text-lg font-semibold text-gray-800 mb-4">Resumen de Actividad</h2>
    <div className="space-y-4">
      <div>
        <h3 className="text-sm font-medium text-gray-600 mb-2">Estado del Sistema</h3>
        <div className="flex items-center">
          <div className="w-3 h-3 rounded-full bg-green-500 mr-2"></div>
          <span className="text-sm text-gray-700">Operativo</span>
        </div>
      </div>
      
      <div>
        <h3 className="text-sm font-medium text-gray-600 mb-2">Rendimiento</h3>
        <div className="w-full bg-gray-100 rounded-full h-2.5 mb-1">
          <div className="bg-purple-600 h-2.5 rounded-full" style={{ width: '85%' }}></div>
        </div>
        <p className="text-xs text-gray-500">Tiempo de respuesta: {stats.avgResponseTime}</p>
      </div>
      
      <div>
        <h3 className="text-sm font-medium text-gray-600 mb-2">Actividad Reciente</h3>
        <p className="text-sm text-gray-700">{stats.messagesLast24h} mensajes en las últimas 24h</p>
        <p className="text-xs text-gray-500 mt-1">
          {stats.pendingResponses} respuestas pendientes
        </p>
      </div>
      
      <div className="pt-2 border-t border-gray-100">
        <h3 className="text-sm font-medium text-gray-600 mb-2">Consejos</h3>
        <ul className="text-xs text-gray-600 space-y-1">
          <li className="flex items-start">
            <span className="text-purple-500 mr-1">•</span>
            <span>Responde a los mensajes pendientes para mejorar el tiempo de respuesta</span>
          </li>
          <li className="flex items-start">
            <span className="text-purple-500 mr-1">•</span>
            <span>Revisa las conversaciones inactivas para reactivarlas</span>
          </li>
        </ul>
      </div>
    </div>
  </div>
);

// Componente principal del Dashboard
export default function Dashboard() {
  const router = useRouter();
  const [stats, setStats] = useState({
    activeChats: 0,
    totalMessages: 0,
    contacts: 0,
    pendingResponses: 0,
    avgResponseTime: '0m',
    messagesLast24h: 0,
    activeContacts7d: 0
  });
  
  const [recentChats, setRecentChats] = useState([]);
  const [hourlyActivity, setHourlyActivity] = useState({});
  const [messageTypes, setMessageTypes] = useState({
    text: 0,
    media: 0,
    document: 0,
    other: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        
        // Fetch all dashboard data from the dedicated API endpoint
        const response = await fetch('/api/dashboard');
        
        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`Failed to fetch dashboard data: ${errorText}`);
        }
        
        const data = await response.json();
        
        // Update state with real data from API
        setStats(data.stats);
        setRecentChats(data.recentChats);
        setHourlyActivity(data.hourlyActivity);
        setMessageTypes(data.messageTypes);
        
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
  
  // Previous loading and error states remain unchanged
  
  return (
    <div className="h-full overflow-auto bg-gray-50">
      <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Header with actions */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 space-y-4 md:space-y-0">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">Panel de Control</h1>
            <p className="text-gray-500 text-sm sm:text-base mt-1">Gestión de conversaciones de WhatsApp</p>
          </div>
          
          <div className="flex items-center space-x-3">
            <button 
              onClick={() => router.push('/chat')}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
              </svg>
              Ver conversaciones
            </button>
            
            <button 
              onClick={() => window.location.reload()}
              className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Actualizar
            </button>
          </div>
        </div>
        
        {/* Stats cards - 3 columns on desktop, 2 on tablet, 1 on mobile */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-6">
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
        
        {/* Main content - 3 column layout on large screens */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left column - Info Panel */}
          <div className="lg:col-span-3 space-y-6">
            {/* Info Panel */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-5">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">Resumen de Actividad</h2>
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-600 mb-2">Estado del Sistema</h3>
                  <div className="flex items-center">
                    <div className="w-3 h-3 rounded-full bg-green-500 mr-2"></div>
                    <span className="text-sm text-gray-700">Operativo</span>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-gray-600 mb-2">Rendimiento</h3>
                  <div className="w-full bg-gray-100 rounded-full h-2.5 mb-1">
                    <div className="bg-purple-600 h-2.5 rounded-full" style={{ width: '85%' }}></div>
                  </div>
                  <p className="text-xs text-gray-500">Tiempo de respuesta: {stats.avgResponseTime}</p>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-gray-600 mb-2">Actividad Reciente</h3>
                  <p className="text-sm text-gray-700">{stats.messagesLast24h} mensajes en las últimas 24h</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {stats.pendingResponses} respuestas pendientes
                  </p>
                </div>
                
                <div className="pt-2 border-t border-gray-100">
                  <h3 className="text-sm font-medium text-gray-600 mb-2">Consejos</h3>
                  <ul className="text-xs text-gray-600 space-y-1">
                    <li className="flex items-start">
                      <span className="text-purple-500 mr-1">•</span>
                      <span>Responde a los mensajes pendientes para mejorar el tiempo de respuesta</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-purple-500 mr-1">•</span>
                      <span>Revisa las conversaciones inactivas para reactivarlas</span>
                    </li>
                  </ul>
                </div>
              </div>
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
          
          {/* Middle column - Hourly activity */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-5 h-full">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">Actividad Reciente</h2>
              <p className="text-sm text-gray-500 mb-4">Mensajes por hora</p>
              <HourlyActivity data={hourlyActivity} />
            </div>
          </div>
          
          {/* Right column - Conversations */}
          <div className="lg:col-span-6">
            <div className="bg-white rounded-lg shadow-sm border border-gray-100 h-full flex flex-col">
              <div className="p-5 border-b border-gray-100 flex justify-between items-center">
                <h2 className="text-lg font-semibold text-gray-800">Conversaciones Recientes</h2>
                <div className="flex space-x-2">
                  <button className="text-gray-400 hover:text-gray-600">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                    </svg>
                  </button>
                  <button className="text-gray-400 hover:text-gray-600">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h13M3 8h9m-9 4h9m5-4v12m0 0l-4-4m4 4l4-4" />
                    </svg>
                  </button>
                </div>
              </div>
              
              <div className="flex-1 overflow-y-auto p-3">
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
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {recentChats.map((chat, index) => (
                      <RecentChat 
                        key={chat.phoneNumber || index} 
                        chat={chat} 
                        onSelect={handleChatSelect} 
                      />
                    ))}
                  </div>
                )}
              </div>
              
              <div className="p-4 border-t border-gray-100">
                <button 
                  onClick={() => router.push('/chat')}
                  className="w-full flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-purple-700 bg-purple-50 hover:bg-purple-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
                >
                  Ver todas las conversaciones
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}