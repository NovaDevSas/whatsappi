'use client';

import { useState } from 'react';
import MessageForm from '@/components/MessageForm';
import ConversationList from '@/components/ConversationList';
import ConversationDetail from '@/components/ConversationDetail';
import { Conversation } from '@/types';

export default function Home() {
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [showSendForm, setShowSendForm] = useState(true);

  const handleSendMessage = async (phoneNumber: string, message: string) => {
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
    setShowSendForm(false);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">WhatsApp Conversations</h1>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left sidebar */}
        <div className="space-y-6">
          <div className="section">
            <div className="section-header">
              <h2 className="section-title">Conversations</h2>
            </div>
            <ConversationList 
              onSelectConversation={handleSelectConversation}
              selectedConversationId={selectedConversation?.id}
            />
          </div>
          
          {showSendForm && (
            <div className="section">
              <div className="section-header">
                <h2 className="section-title">New Message</h2>
              </div>
              <MessageForm onSendMessage={handleSendMessage} />
            </div>
          )}
        </div>
        
        {/* Main content */}
        <div className="lg:col-span-2">
          <div className="section h-full">
            <ConversationDetail 
              conversation={selectedConversation}
              onSendMessage={handleSendMessage}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
