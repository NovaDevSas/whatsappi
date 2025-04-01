import { NextRequest, NextResponse } from 'next/server';
import { getConnectionPool } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const { phoneNumber, message } = await request.json();
    
    if (!phoneNumber || !message) {
      return NextResponse.json(
        { error: 'Phone number and message are required' },
        { status: 400 }
      );
    }
    
    const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
    const accessToken = process.env.WHATSAPP_ACCESS_TOKEN;
    
    if (!phoneNumberId || !accessToken) {
      return NextResponse.json(
        { error: 'WhatsApp API configuration is missing' },
        { status: 500 }
      );
    }
    
    // Send message via WhatsApp API
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
          to: phoneNumber,
          type: 'text',
          text: {
            body: message,
          },
        }),
      }
    );
    
    if (!response.ok) {
      const errorData = await response.json();
      console.error('WhatsApp API error:', errorData);
      return NextResponse.json(
        { error: `WhatsApp API error: ${errorData.error?.message || 'Unknown error'}` },
        { status: response.status }
      );
    }
    
    const data = await response.json();
    console.log('WhatsApp send message response:', data);
    
    // Get database connection
    const pool = await getConnectionPool();
    
    // Check if contact exists, if not create it
    const contactQuery = `
      INSERT INTO contacts (wa_id, profile_name)
      VALUES ($1, $2)
      ON CONFLICT (wa_id) DO UPDATE SET profile_name = EXCLUDED.profile_name
      RETURNING id
    `;
    
    const contactResult = await pool.query(contactQuery, [phoneNumber, null]);
    const contactId = contactResult.rows[0].id;
    
    // Store the message in the database
    const messageQuery = `
      INSERT INTO messages (
        contact_id, 
        message_wamid, 
        phone_number_id, 
        display_phone, 
        text_body, 
        message_type, 
        timestamp_unix, 
        direction
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
    `;
    
    const timestamp = Math.floor(Date.now() / 1000);
    
    await pool.query(messageQuery, [
      contactId,
      data.messages[0].id,
      phoneNumberId,
      phoneNumber,
      message,
      'text',
      timestamp,
      'outbound'
    ]);
    
    return NextResponse.json({
      success: true,
      messageId: data.messages[0].id,
    });
  } catch (error) {
    console.error('Error sending message:', error);
    return NextResponse.json(
      { error: 'Failed to send message' },
      { status: 500 }
    );
  }
}