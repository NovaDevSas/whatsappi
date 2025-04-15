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

  // Remove unused error parameter
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
    } catch {
      setStatus({
        type: 'error',
        message: 'Ocurrió un error al enviar el mensaje',
      });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {!hidePhoneNumber && (
        <div>
          <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700">
            Phone Number
          </label>
          <input
            type="tel"
            id="phoneNumber"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 transition-all"
            placeholder="+1234567890"
          />
        </div>
      )}
      
      <div>
        <label htmlFor="message" className="block text-sm font-medium text-gray-700">
          Message
        </label>
        <textarea
          id="message"
          rows={3}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 transition-all"
          placeholder="Type your message here..."
        />
      </div>
      
      {status && (
        <div className={`rounded-lg p-4 ${
          status.type === 'error' ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'
        } shadow-sm transition-all`}>
          {status.message}
        </div>
      )}
      
      <div className="flex justify-end w-full">
        <button
          type="submit"
          disabled={sending}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg shadow-sm text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed w-full sm:w-auto h-12"
        >
          {sending ? (
            <>
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span className="mr-1">Enviando...</span>
            </>
          ) : (
            <span className="flex items-center justify-center">
              <span className="mr-1 sm:inline hidden">Enviar Mensaje</span>
              <span className="sm:hidden inline">Enviar</span>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-1" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </span>
          )}
        </button>
      </div>
    </form>
  );
}