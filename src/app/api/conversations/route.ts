import { NextResponse } from 'next/server';
import { Conversation } from '@/types';

async function getConversations(): Promise<Conversation[]> {
  try {
    const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
    const accessToken = process.env.WHATSAPP_ACCESS_TOKEN;
    
    if (!phoneNumberId || !accessToken) {
      throw new Error('WhatsApp API configuration is missing');
    }
    
    // Fetch messages instead of trying to access conversations directly
    const response = await fetch(
      `https://graph.facebook.com/v17.0/${phoneNumberId}/messages?limit=20`,
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      }
    );
    
    if (!response.ok) {
      const errorData = await response.json();
      console.error('WhatsApp API error:', errorData);
      throw new Error(`WhatsApp API error: ${errorData.error?.message || 'Unknown error'}`);
    }
    
    const data = await response.json();
    console.log('WhatsApp messages response:', data);
    
    // Group messages by phone number to create conversations
    const conversationMap = new Map<string, Conversation>();
    
    if (data.data && Array.isArray(data.data)) {
      data.data.forEach((msg: any) => {
        // Skip messages without proper data
        if (!msg.from || !msg.to) return;
        
        // Determine if this is an incoming or outgoing message
        const isOutgoing = msg.from.id === phoneNumberId;
        const phoneNumber = isOutgoing ? msg.to.wa_id : msg.from.wa_id;
        
        if (!phoneNumber) return;
        
        // Create or update conversation
        if (!conversationMap.has(phoneNumber)) {
          conversationMap.set(phoneNumber, {
            id: phoneNumber, // Use phone number as ID
            phoneNumber: phoneNumber,
            contact: {
              name: isOutgoing ? undefined : (msg.from.name || phoneNumber),
            },
            lastMessage: {
              text: msg.text?.body || '',
              timestamp: msg.timestamp,
            },
            unreadCount: 0, // We don't have this info from the API
          });
        } else {
          // Update last message if this one is newer
          const conv = conversationMap.get(phoneNumber)!;
          const currentTimestamp = new Date(conv.lastMessage?.timestamp || 0).getTime();
          const newTimestamp = new Date(msg.timestamp).getTime();
          
          if (newTimestamp > currentTimestamp) {
            conv.lastMessage = {
              text: msg.text?.body || '',
              timestamp: msg.timestamp,
            };
          }
        }
      });
    }
    
    // Convert map to array and sort by last message timestamp (newest first)
    const conversations = Array.from(conversationMap.values())
      .sort((a, b) => {
        const timeA = new Date(a.lastMessage?.timestamp || 0).getTime();
        const timeB = new Date(b.lastMessage?.timestamp || 0).getTime();
        return timeB - timeA;
      });
    
    return conversations;
  } catch (error) {
    console.error('Error fetching real conversations:', error);
    // Fallback to empty array if there's an error
    return [];
  }
}

export async function GET() {
  try {
    const conversations = await getConversations();
    return NextResponse.json({ conversations });
  } catch (error) {
    console.error('Error in conversations endpoint:', error);
    return NextResponse.json(
      { error: 'Failed to fetch conversations' },
      { status: 500 }
    );
  }
}