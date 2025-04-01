import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { useConversations } from '@/contexts/ConversationContext';

export default function ChatPanel() {
  const { 
    selectedConversation, 
    messages, 
    loading, 
    error, 
    sendMessage 
  } = useConversations();
  
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedConversation || !newMessage.trim()) return;
    
    try {
      const result = await sendMessage(selectedConversation.phoneNumber, newMessage);
      
      if (result.success) {
        setNewMessage(''); // Clear input after successful send
      } else {
        // Could show an error toast here
        console.error('Failed to send message:', result.error);
      }
    } catch (error) {
      console.error('Error in send message handler:', error);
    }
  };

  // If no conversation is selected, show a placeholder
  if (!selectedConversation) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-gray-50 p-8">
        <div className="text-center">
          <div className="mb-4">
            <Image 
              src="/images/logonova.webp" 
              alt="Nova Dev Logo" 
              width={180} 
              height={180} 
              className="mx-auto"
            />
          </div>
          <h2 className="text-xl font-semibold text-gray-700 mb-2">Welcome to WhatsApp API Manager</h2>
          <p className="text-gray-500 max-w-md">
            Select a conversation from the list to view messages and start chatting.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex bg-white">
      {/* Chat area with messages */}
      <div className="flex-1 flex flex-col">
        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
          {loading.messages ? (
            <div className="flex justify-center p-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
            </div>
          ) : error.messages ? (
            <div className="p-4 text-center text-red-500">{error.messages}</div>
          ) : messages.length === 0 ? (
            <div className="p-4 text-center text-gray-500">No messages yet</div>
          ) : (
            <div className="space-y-4">
              {messages.map((message) => (
                <div 
                  key={message.id} 
                  className={`p-4 rounded-lg max-w-[80%] ${
                    message.direction === 'incoming' 
                      ? 'bg-white ml-0 mr-auto' 
                      : 'bg-purple-100 ml-auto mr-0'
                  }`}
                >
                  <div className="flex justify-between mb-1">
                    <span className="font-medium text-sm">
                      {message.direction === 'incoming' ? 'Them' : 'You'}
                    </span>
                    <span className="text-xs text-gray-500">
                      {new Date(message.timestamp).toLocaleTimeString([], { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}
                    </span>
                  </div>
                  <p className="text-gray-800">{message.message}</p>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>
        
        {/* Message Input */}
        <div className="border-t border-gray-200 p-4">
          <form onSubmit={handleSendMessage} className="flex">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type a message..."
              className="flex-1 px-4 py-2 border border-gray-300 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
            <button
              type="submit"
              disabled={!newMessage.trim()}
              className="bg-purple-600 text-white px-4 py-2 rounded-r-lg hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Send
            </button>
          </form>
        </div>
      </div>
      
      {/* Contact information sidebar on the right */}
      <div className="w-64 border-l border-gray-200 bg-white p-4">
        <div className="flex flex-col items-center">
          <div className="h-20 w-20 rounded-full bg-purple-500 flex items-center justify-center text-white text-2xl font-medium mb-4">
            {(selectedConversation.contact?.name?.[0] || selectedConversation.phoneNumber[0]).toUpperCase()}
          </div>
          
          <h2 className="text-lg font-medium text-gray-900 text-center mb-1">
            {selectedConversation.contact?.name || 'Unknown Contact'}
          </h2>
          
          <p className="text-sm text-gray-500 text-center mb-6">
            {selectedConversation.phoneNumber}
          </p>
          
          <div className="w-full border-t border-gray-200 pt-4">
            <h3 className="text-sm font-medium text-gray-700 mb-2">Contact Info</h3>
            
            <div className="space-y-3">
              <div>
                <p className="text-xs text-gray-500">Phone Number</p>
                <p className="text-sm">{selectedConversation.phoneNumber}</p>
              </div>
              
              {selectedConversation.contact?.name && (
                <div>
                  <p className="text-xs text-gray-500">Name</p>
                  <p className="text-sm">{selectedConversation.contact.name}</p>
                </div>
              )}
              
              {selectedConversation.lastMessage && (
                <div>
                  <p className="text-xs text-gray-500">Last Activity</p>
                  <p className="text-sm">
                    {new Date(selectedConversation.lastMessage.timestamp).toLocaleString()}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}