'use client';

import { useState } from 'react';

interface MessageFormProps {
  onSendMessage: (phoneNumber: string, message: string) => Promise<{ success: boolean; error?: string }>;
  hidePhoneNumber?: boolean;
  initialPhoneNumber?: string;
}

export default function MessageForm({ 
  onSendMessage, 
  hidePhoneNumber = false,
  initialPhoneNumber = ''
}: MessageFormProps) {
  const [phoneNumber, setPhoneNumber] = useState(initialPhoneNumber);
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [status, setStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const targetPhoneNumber = hidePhoneNumber ? initialPhoneNumber : phoneNumber;
    
    if ((!hidePhoneNumber && !targetPhoneNumber) || !message) {
      setStatus({
        type: 'error',
        message: hidePhoneNumber 
          ? 'Please provide a message' 
          : 'Please provide both phone number and message',
      });
      return;
    }

    setSending(true);
    setStatus(null);

    try {
      const result = await onSendMessage(targetPhoneNumber, message);
      
      if (result.success) {
        setStatus({
          type: 'success',
          message: 'Message sent successfully!',
        });
        setMessage(''); // Clear message input
      } else {
        setStatus({
          type: 'error',
          message: result.error || 'Failed to send message',
        });
      }
    } catch (error) {
      setStatus({
        type: 'error',
        message: 'An error occurred while sending the message',
      });
    } finally {
      setSending(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {!hidePhoneNumber && (
        <div>
          <label htmlFor="phoneNumber" className="block text-sm font-medium mb-1">
            Phone Number (with country code)
          </label>
          <input
            type="text"
            id="phoneNumber"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            placeholder="+1234567890"
            className="w-full p-2 border border-gray-300 rounded-md"
            required={!hidePhoneNumber}
          />
        </div>
      )}
      
      <div>
        {!hidePhoneNumber && (
          <label htmlFor="message" className="block text-sm font-medium mb-1">
            Message
          </label>
        )}
        <textarea
          id="message"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Type your message here..."
          rows={hidePhoneNumber ? 2 : 4}
          className="w-full p-2 border border-gray-300 rounded-md"
          required
        />
      </div>
      
      <button
        type="submit"
        disabled={sending}
        className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 disabled:bg-gray-400"
      >
        {sending ? 'Sending...' : 'Send Message'}
      </button>
      
      {status && (
        <div className={`p-3 rounded-md ${
          status.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
        }`}>
          {status.message}
        </div>
      )}
    </form>
  );
}