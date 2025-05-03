export interface Message {
  id: string;
  phoneNumber: string;
  message: string;
  timestamp: string;
  direction: 'incoming' | 'outgoing';
}

export interface Contact {
  id: string;
  waId: string;  // wa_id en la base de datos
  profileName: string | null;
  createdAt: string;
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
  lastMessageTime?: string; // Añadimos esta propiedad para compatibilidad con ContactInfo
  unreadCount: number;
}