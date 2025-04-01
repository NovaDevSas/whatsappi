'use client';

import { useState, useEffect } from 'react';
import MessageList from '@/components/MessageList';
import MessageForm from '@/components/MessageForm';
import ConversationList from '@/components/ConversationList';
import ConversationDetail from '@/components/ConversationDetail';
import { Conversation } from '@/types';

export default function Home() {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'conversations'>('dashboard');
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);

  useEffect(() => {
    // Fetch messages when component mounts
    fetchMessages();
  }, []);

  const fetchMessages = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/messages');
      const data = await response.json();
      setMessages(data.messages);
    } catch (error) {
      console.error('Error fetching messages:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async (phoneNumber, message) => {
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
        // Refresh messages after sending
        fetchMessages();
        return { success: true };
      } else {
        return { success: false, error: data.error };
      }
    } catch (error) {
      console.error('Error sending message:', error);
      return { success: false, error: 'Failed to send message' };
    }
  };

  const handleSelectConversation = (conversation: Conversation) => {
    setSelectedConversation(conversation);
  };

  return (
    <main className="flex min-h-screen flex-col items-center p-8">
      <div className="z-10 max-w-6xl w-full">
        <h1 className="text-3xl font-bold mb-6 text-center">WhatsApp API Manager</h1>
        
        <div className="mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab('dashboard')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'dashboard'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Dashboard
              </button>
              <button
                onClick={() => setActiveTab('conversations')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'conversations'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Conversations
              </button>
            </nav>
          </div>
        </div>
        
        {activeTab === 'dashboard' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h2 className="text-2xl font-semibold mb-4">Send Message</h2>
              <MessageForm onSendMessage={handleSendMessage} />
            </div>
            
            <div>
              <h2 className="text-2xl font-semibold mb-4">Recent Messages</h2>
              {loading ? (
                <p>Loading messages...</p>
              ) : (
                <MessageList messages={messages} />
              )}
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-[calc(100vh-200px)]">
            <div className="md:col-span-1">
              <ConversationList 
                onSelectConversation={handleSelectConversation}
                selectedConversationId={selectedConversation?.id}
              />
            </div>
            <div className="md:col-span-2 h-full">
              <ConversationDetail 
                conversation={selectedConversation}
                onSendMessage={handleSendMessage}
              />
            </div>
          </div>
        )}
        
        {/* Add error message if environment variables are not set */}
        {activeTab === 'conversations' && (!process.env.WHATSAPP_PHONE_NUMBER_ID || !process.env.WHATSAPP_ACCESS_TOKEN) && (
          <div className="mt-4 p-4 bg-yellow-100 text-yellow-800 rounded-md">
            <p className="font-medium">WhatsApp API configuration is incomplete</p>
            <p className="mt-1">Please set up your environment variables in the Configuration page.</p>
          </div>
        )}
      </div>
    </main>
  );
}
