interface Message {
  id: string;
  phoneNumber: string;
  message: string;
  timestamp: string;
  direction: 'incoming' | 'outgoing';
}

interface MessageListProps {
  messages: Message[];
}

export default function MessageList({ messages }: MessageListProps) {
  if (messages.length === 0) {
    return <p className="text-gray-500">No messages yet.</p>;
  }

  return (
    <div className="space-y-4 max-h-[600px] overflow-y-auto">
      {messages.map((message) => (
        <div 
          key={message.id} 
          className={`p-4 rounded-lg ${
            message.direction === 'incoming' 
              ? 'bg-gray-100' 
              : 'bg-green-100'
          }`}
        >
          <div className="flex justify-between mb-2">
            <span className="font-medium">{message.phoneNumber}</span>
            <span className="text-xs text-gray-500">
              {new Date(message.timestamp).toLocaleString()}
            </span>
          </div>
          <p>{message.message}</p>
        </div>
      ))}
    </div>
  );
}