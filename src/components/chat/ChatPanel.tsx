import React, { useRef, useEffect, useState } from 'react';
import { useConversations } from '@/contexts/ConversationContext';
import { useWebSocket } from '@/contexts/WebSocketContext';

export default function ChatPanel() {
  const { activeConversation, messages, sendMessage, refreshMessages } = useConversations();
  const { isConnected, notificationsEnabled, toggleNotifications } = useWebSocket();
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [showContactInfo, setShowContactInfo] = useState(false);
  const [sendError, setSendError] = useState<string | null>(null);
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Scroll to bottom when messages change
  useEffect(() => {
    if (messages.length > 0) {
      scrollToBottom();
    }
  }, [messages]);
  
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };
  
  const handleRefreshMessages = async () => {
    if (!activeConversation) return;
    
    setIsLoadingMessages(true);
    try {
      await refreshMessages();
      setLastRefresh(new Date());
    } finally {
      setIsLoadingMessages(false);
      // Scroll to bottom after messages are loaded
      setTimeout(scrollToBottom, 100);
    }
  };
  
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newMessage.trim() || !activeConversation) return;
    
    setIsLoading(true);
    setSendError(null); // Clear any previous errors
    
    try {
      const success = await sendMessage(activeConversation.phoneNumber, newMessage);
      if (success) {
        setNewMessage('');
        setLastRefresh(new Date());
      } else {
        setSendError('Failed to send message. Please try again.');
      }
    } catch (error) {
      console.error('Error sending message:', error);
      setSendError('An error occurred while sending the message.');
    } finally {
      setIsLoading(false);
    }
  };

  // If no conversation is selected, show a placeholder
  if (!activeConversation) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-gray-50 p-8">
        <div className="text-center">
          <h3 className="text-lg font-medium text-gray-900 mb-2">No conversation selected</h3>
          <p className="text-gray-500">Select a conversation from the list or start a new one</p>
        </div>
      </div>
    );
  }

  // Add this new function to test notifications
  const testNotification = () => {
    console.log('Testing notification...');
    
    if (!('Notification' in window)) {
      alert('This browser does not support notifications');
      return;
    }
    
    console.log('Current notification permission:', Notification.permission);
    
    if (Notification.permission === 'granted') {
      showTestNotification();
    } else if (Notification.permission !== 'denied') {
      Notification.requestPermission().then(permission => {
        console.log('Permission response:', permission);
        if (permission === 'granted') {
          showTestNotification();
        } else {
          alert('Notification permission was not granted');
        }
      });
    } else {
      alert('Notification permission denied. Please enable notifications in your browser settings.');
    }
  };
  
  // Separate function to show the test notification
  const showTestNotification = () => {
    try {
      const notification = new Notification('Test Notification', {
        body: 'This is a test notification from WhatsApp',
        icon: '/favicon.ico'
      });
      
      // Auto close after 5 seconds
      setTimeout(() => notification.close(), 5000);
      
      // Handle click
      notification.onclick = () => {
        window.focus();
        notification.close();
      };
    } catch (error) {
      console.error('Error creating notification:', error);
      alert('Error creating notification: ' + error);
    }
  };

  return (
    <div className="flex-1 flex">
      <div className={`flex-1 flex flex-col ${showContactInfo ? 'hidden md:flex' : 'flex'}`}>
        {/* Chat header */}
        <div className="bg-white border-b border-gray-200 px-4 py-3 flex justify-between items-center">
          <div className="flex items-center">
            <div 
              className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 font-medium mr-3 cursor-pointer"
              onClick={() => setShowContactInfo(true)}
            >
              {activeConversation.contact?.name?.[0]?.toUpperCase() || activeConversation.phoneNumber[0]}
            </div>
            <div>
              <h2 className="font-medium text-gray-800">
                {activeConversation.contact?.name || activeConversation.phoneNumber}
              </h2>
            </div>
          </div>
          <div className="flex items-center">
            {isConnected ? (
              <span className="text-xs text-green-500 flex items-center mr-3">
                <span className="w-2 h-2 bg-green-500 rounded-full mr-1"></span>
                Connected
              </span>
            ) : (
              <span className="text-xs text-red-500 flex items-center mr-3">
                <span className="w-2 h-2 bg-red-500 rounded-full mr-1"></span>
                Disconnected
              </span>
            )}
            {lastRefresh && (
              <span className="text-xs text-gray-500 mr-3">
                Last updated: {lastRefresh.toLocaleTimeString()}
              </span>
            )}
            {/* Test notification button */}
            <button 
              onClick={testNotification}
              className="p-2 rounded-full hover:bg-gray-100 text-gray-500 mr-2"
              title="Test Notification"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-orange-500" viewBox="0 0 20 20" fill="currentColor">
                <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z" />
                <path d="M10 4a1 1 0 011 1v1a1 1 0 11-2 0V5a1 1 0 011-1z" />
              </svg>
            </button>
            {/* Notification toggle button */}
            <button 
              onClick={toggleNotifications}
              className="p-2 rounded-full hover:bg-gray-100 text-gray-500 mr-2"
              title={notificationsEnabled ? "Disable notifications" : "Enable notifications"}
            >
              {notificationsEnabled ? (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-500" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z" />
                  <line x1="3" y1="3.5" x2="17" y2="3.5" stroke="currentColor" strokeWidth="1.5" />
                </svg>
              )}
            </button>
            <button 
              onClick={() => handleRefreshMessages()}
              className="p-2 rounded-full hover:bg-gray-100 text-gray-500"
              disabled={isLoadingMessages}
              title="Refresh messages"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 ${isLoadingMessages ? 'animate-spin' : ''}`} viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        </div>
        
        {/* Messages */}
        <div className="flex-1 bg-gray-100 p-4 overflow-y-auto">
          {isLoadingMessages ? (
            <div className="flex justify-center items-center h-full">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
            </div>
          ) : messages.length === 0 ? (
            <div className="flex justify-center items-center h-full">
              <p className="text-gray-500">No messages yet</p>
            </div>
          ) : (
            <div className="space-y-4">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.direction === 'outgoing' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[75%] rounded-lg px-4 py-2 ${
                      msg.direction === 'outgoing' 
                        ? 'bg-purple-600 text-white' 
                        : 'bg-white text-gray-800 border border-gray-200'
                    }`}
                  >
                    <p>{msg.message}</p>
                    <div className={`text-xs mt-1 ${msg.direction === 'outgoing' ? 'text-purple-200' : 'text-gray-500'}`}>
                      {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>
        
        {/* Message input */}
        <div className="bg-white border-t border-gray-200 p-4">
          {sendError && (
            <div className="mb-2 text-sm text-red-500 p-2 bg-red-50 rounded">
              {sendError}
            </div>
          )}
          <form onSubmit={handleSendMessage} className="flex items-center">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type a message..."
              className="flex-1 border border-gray-300 rounded-l-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
            <button
              type="submit"
              disabled={isLoading || !newMessage.trim()}
              className={`bg-purple-600 text-white px-4 py-2 rounded-r-lg ${
                isLoading || !newMessage.trim() ? 'opacity-50 cursor-not-allowed' : 'hover:bg-purple-700'
              }`}
            >
              {isLoading ? (
                <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
              ) : (
                'Send'
              )}
            </button>
          </form>
        </div>
      </div>
      
      {/* Contact info panel */}
      {showContactInfo && (
        <div className="w-80 border-l border-gray-200 bg-white p-4">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium text-gray-900">Contact Info</h3>
            <button 
              onClick={() => setShowContactInfo(false)}
              className="p-2 rounded-full hover:bg-gray-100 text-gray-500"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
          
          <div className="flex flex-col items-center mb-6">
            <div className="w-24 h-24 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 text-3xl font-medium mb-3">
              {activeConversation.contact?.name?.[0]?.toUpperCase() || activeConversation.phoneNumber[0]}
            </div>
            <h4 className="text-xl font-medium text-gray-900">
              {activeConversation.contact?.name || 'Unknown'}
            </h4>
            <p className="text-gray-500">{activeConversation.phoneNumber}</p>
          </div>
          
          <div className="border-t border-gray-200 pt-4">
            <h5 className="text-sm font-medium text-gray-500 mb-2">About</h5>
            <p className="text-gray-700">
              {activeConversation.contact?.name ? `Contact from WhatsApp` : 'No information available'}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
