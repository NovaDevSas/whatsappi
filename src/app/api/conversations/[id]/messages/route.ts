import { NextRequest, NextResponse } from 'next/server';
import { Message } from '@/types';

async function getMessagesForConversation(phoneNumber: string): Promise<Message[]> {
  try {
    const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
    const accessToken = process.env.WHATSAPP_ACCESS_TOKEN;
    
    if (!phoneNumberId || !accessToken) {
      throw new Error('WhatsApp API configuration is missing');
    }
    
    // Fetch messages from the WhatsApp API
    const response = await fetch(
      `https://graph.facebook.com/v17.0/${phoneNumberId}/messages?limit=100`,
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
    
    // Filter messages for this specific phone number
    const messages: Message[] = [];
    
    if (data.data && Array.isArray(data.data)) {
      data.data.forEach((msg: any) => {
        // Skip messages without proper data
        if (!msg.from || !msg.to) return;
        
        // Determine if this is an incoming or outgoing message
        const isOutgoing = msg.from.id === phoneNumberId;
        const msgPhoneNumber = isOutgoing ? msg.to.wa_id : msg.from.wa_id;
        
        // Only include messages for the requested phone number
        if (msgPhoneNumber === phoneNumber) {
          messages.push({
            id: msg.id,
            phoneNumber: msgPhoneNumber,
            message: msg.text?.body || '',
            timestamp: msg.timestamp,
            direction: isOutgoing ? 'outgoing' : 'incoming',
          });
        }
      });
    }
    
    // Sort messages by timestamp (oldest first)
    return messages.sort((a, b) => 
      new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    );
  } catch (error) {
    console.error('Error fetching real messages:', error);
    // Fallback to empty array if there's an error
    return [];
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const phoneNumber = params.id;
    
    if (!phoneNumber) {
      return NextResponse.json(
        { error: 'Phone number is required' },
        { status: 400 }
      );
    }
    
    const messages = await getMessagesForConversation(phoneNumber);
    
    return NextResponse.json({ messages });
  } catch (error) {
    console.error('Error in messages endpoint:', error);
    return NextResponse.json(
      { error: 'Failed to fetch messages' },
      { status: 500 }
    );
  }
}