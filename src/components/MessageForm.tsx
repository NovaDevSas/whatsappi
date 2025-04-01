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
          ? 'Por favor escribe un mensaje' 
          : 'Por favor proporciona un número de teléfono y un mensaje',
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
          message: '¡Mensaje enviado con éxito!',
        });
        setMessage(''); // Clear message input
      } else {
        setStatus({
          type: 'error',
          message: result.error || 'Error al enviar el mensaje',
        });
      }
    } catch (error) {
      setStatus({
        type: 'error',
        message: 'Ocurrió un error al enviar el mensaje',
      });
    } finally {
      setSending(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {!hidePhoneNumber && (
        <div className="mb-3">
          <label htmlFor="phoneNumber" className="block text-sm font-medium mb-1 text-gray-700">
            Número de teléfono (con código de país)
          </label>
          <input
            type="text"
            id="phoneNumber"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            placeholder="+1234567890"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required={!hidePhoneNumber}
          />
        </div>
      )}
      
      <div className="flex">
        <textarea
          id="message"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Escribe tu mensaje aquí..."
          rows={hidePhoneNumber ? 1 : 3}
          className="flex-1 px-3 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
          required
        />
        <button
          type="submit"
          disabled={sending}
          className="px-4 bg-blue-600 text-white rounded-r-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-gray-400"
        >
          {sending ? (
            <div className="inline-block animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
            </svg>
          )}
        </button>
      </div>
      
      {status && (
        <div className={`mt-2 p-2 rounded-md text-sm ${
          status.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
        }`}>
          <div className="flex items-center">
            {status.type === 'success' ? (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            )}
            {status.message}
          </div>
        </div>
      )}
    </form>
  );
}