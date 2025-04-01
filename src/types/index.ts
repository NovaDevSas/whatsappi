export interface Message {
  id: string;
  phoneNumber: string;
  message: string;
  timestamp: string;
  direction: 'incoming' | 'outgoing';
}

export interface Conversation {
  id: string;
  phoneNumber: string;
  contact?: {
    name?: string;
    profilePicture?: string;
  };
  lastMessage?: {
    text: string;
    timestamp: string;
  };
  unreadCount: number;
}