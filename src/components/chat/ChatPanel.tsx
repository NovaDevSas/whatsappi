import React, { useRef, useEffect, useState } from 'react';
import { useConversations } from '@/contexts/ConversationContext';
import { useWebSocket } from '@/contexts/WebSocketContext';
import ContactInfo from './ContactInfo';

interface ChatPanelProps {
  isMobile?: boolean;
  onBackClick?: () => void;
}

export default function ChatPanel({ isMobile = false, onBackClick }: ChatPanelProps) {
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
      <div className="flex-1 flex flex-col items-center justify-center bg-gray-50 p-4 md:p-8 animate-fade-in">
        <div className="text-center max-w-md">
          <div className="mb-6 bg-purple-100 text-purple-600 rounded-full p-4 inline-block">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
            </svg>
          </div>
          <h2 className="text-xl md:text-2xl font-bold text-gray-800 mb-2">No conversation selected</h2>
          <p className="text-gray-600">Select a conversation from the list to start chatting</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full w-full bg-gray-50 overflow-hidden">
      {/* Sticky header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10 shadow-sm">
        <div className="flex items-center p-3 md:p-4">
          {isMobile && (
            <button 
              onClick={onBackClick}
              className="mr-2 p-2 rounded-full hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500 touch-manipulation"
              aria-label="Back to conversations"
            >
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                className="h-5 w-5 text-gray-600" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M15 19l-7-7 7-7" 
                />
              </svg>
            </button>
          )}
          
          <div 
            className="flex items-center flex-1 min-w-0 cursor-pointer"
            onClick={() => setShowContactInfo(!showContactInfo)}
          >
            <div className="w-10 h-10 flex-shrink-0 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 font-medium mr-3 shadow-sm">
              {(activeConversation.contact?.name || activeConversation.phoneNumber).charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
              <h2 className="font-medium text-gray-900 truncate">
                {activeConversation.contact?.name || activeConversation.phoneNumber}
              </h2>
              <div className="flex items-center">
                <span className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-gray-300'} mr-2`}></span>
                <span className="text-xs text-gray-500 truncate">
                  {isConnected ? 'Connected' : 'Disconnected'}
                </span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center">
            <button 
              onClick={handleRefreshMessages}
              disabled={isLoadingMessages}
              className="p-2 rounded-full hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500 mr-1 touch-manipulation"
              aria-label="Refresh messages"
            >
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                className={`h-5 w-5 text-gray-600 ${isLoadingMessages ? 'animate-spin' : ''}`}
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" 
                />
              </svg>
            </button>
            
            <button 
              onClick={toggleNotifications}
              className="p-2 rounded-full hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500 touch-manipulation"
              aria-label={notificationsEnabled ? "Disable notifications" : "Enable notifications"}
            >
              {notificationsEnabled ? (
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  className="h-5 w-5 text-gray-600" 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" 
                  />
                </svg>
              ) : (
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  className="h-5 w-5 text-gray-600" 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" 
                  />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>
      
      {/* Messages container - scrollable area */}
      <div className="flex-1 overflow-y-auto p-3 md:p-4 bg-gray-50 chat-messages">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-500">
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              className="h-12 w-12 mb-4 text-gray-400" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" 
              />
            </svg>
            <p>No messages yet</p>
            <p className="text-sm mt-2">Start the conversation by sending a message below</p>
          </div>
        ) : (
          <div className="space-y-3">
            {messages.map((message) => (
              <div 
                key={message.id} 
                className={`flex ${
                  message.direction === 'incoming' ? 'justify-start' : 'justify-end'
                }`}
              >
                <div 
                  className={`max-w-[80%] md:max-w-[70%] p-3 rounded-lg break-words ${
                    message.direction === 'incoming' 
                      ? 'bg-white border border-gray-200 shadow-sm' 
                      : 'bg-purple-600 text-white shadow-sm'
                  }`}
                >
                  <p className="whitespace-pre-wrap">{message.message}</p>
                  <p className={`text-xs mt-1 text-right ${
                    message.direction === 'incoming' ? 'text-gray-500' : 'text-purple-200'
                  }`}>
                    {new Date(message.timestamp).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} className="h-3" />
          </div>
        )}
      </div>
      
      {/* Message input - sticky at bottom */}
      <div className="border-t border-gray-200 bg-white p-3 md:p-4 sticky bottom-0 z-10 shadow-sm">
        {sendError && (
          <div className="mb-2 p-2 bg-red-100 text-red-700 rounded-lg text-sm">
            {sendError}
          </div>
        )}
        <form onSubmit={handleSendMessage} className="flex items-center">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white text-base"
          />
          <button
            type="submit"
            disabled={isLoading || !newMessage.trim()}
            className={`ml-2 p-3 rounded-lg ${
              isLoading || !newMessage.trim()
                ? 'bg-gray-300 cursor-not-allowed'
                : 'bg-purple-600 hover:bg-purple-700 text-white shadow-sm'
            } transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500 touch-manipulation`}
          >
            {isLoading ? (
              <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                className="h-6 w-6" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" 
                />
              </svg>
            )}
          </button>
        </form>
      </div>
      
      {/* Contact info sidebar - slide in from right */}
      {showContactInfo && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex justify-end">
          <div className="w-full max-w-md bg-white h-full overflow-y-auto animate-slide-in-right">
            <ContactInfo 
              conversation={activeConversation} 
              onClose={() => setShowContactInfo(false)} 
            />
          </div>
        </div>
      )}
    </div>
  );
}
