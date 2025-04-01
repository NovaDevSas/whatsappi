import { NextRequest, NextResponse } from 'next/server';

// This function will use the WhatsApp API with environment variables
async function sendWhatsAppMessage(phoneNumber: string, message: string) {
  // Get credentials from environment variables
  const apiKey = process.env.WHATSAPP_API_KEY;
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
  const accessToken = process.env.WHATSAPP_ACCESS_TOKEN;
  
  // Validate configuration
  if (!apiKey || !phoneNumberId || !accessToken) {
    throw new Error('WhatsApp API configuration is missing');
  }
  
  console.log(`Attempting to send message to ${phoneNumber}: ${message}`);
  
  // Format the phone number (remove + if present)
  const formattedPhoneNumber = phoneNumber.startsWith('+') 
    ? phoneNumber.substring(1) 
    : phoneNumber;
  
  try {
    // Make the actual API call to WhatsApp
    const response = await fetch(
      `https://graph.facebook.com/v17.0/${phoneNumberId}/messages`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messaging_product: 'whatsapp',
          recipient_type: 'individual',
          to: formattedPhoneNumber,
          type: 'text',
          text: {
            preview_url: false,
            body: message
          }
        }),
      }
    );
    
    const data = await response.json();
    console.log('WhatsApp API response:', data);
    
    if (!response.ok) {
      throw new Error(`WhatsApp API error: ${data.error?.message || 'Unknown error'}`);
    }
    
    return {
      success: true,
      messageId: data.messages?.[0]?.id || `msg_${Date.now()}`,
      apiResponse: data
    };
  } catch (error) {
    console.error('Error calling WhatsApp API:', error);
    throw error;
  }
}

export async function POST(request: NextRequest) {
  try {
    const { phoneNumber, message } = await request.json();
    
    if (!phoneNumber || !message) {
      return NextResponse.json(
        { error: 'Phone number and message are required' },
        { status: 400 }
      );
    }
    
    // Validate phone number format (basic validation)
    if (!phoneNumber.match(/^\+[0-9]{10,15}$/)) {
      return NextResponse.json(
        { error: 'Invalid phone number format. Use format: +1234567890' },
        { status: 400 }
      );
    }
    
    const result = await sendWhatsAppMessage(phoneNumber, message);
    
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error sending message:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to send message' },
      { status: 500 }
    );
  }
}