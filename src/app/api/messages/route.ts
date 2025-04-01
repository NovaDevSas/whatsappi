import { NextResponse } from 'next/server';
import { getConnectionPool } from '@/lib/db';
import { Message } from '@/types';

async function getMessages(): Promise<Message[]> {
  try {
    // Get database connection
    const pool = await getConnectionPool();
    
    // Query to get recent messages across all contacts
    const query = `
      SELECT 
        m.id,
        m.message_wamid,
        c.wa_id as phone_number,
        m.text_body,
        m.timestamp_unix,
        m.direction
      FROM 
        messages m
      JOIN 
        contacts c ON m.contact_id = c.id
      ORDER BY 
        m.timestamp_unix DESC
      LIMIT 20
    `;
    
    const result = await pool.query(query);
    console.log(`Found ${result.rows.length} recent messages`);
    
    // Transform database results to Message objects
    const messages: Message[] = result.rows.map(row => ({
      id: row.message_wamid,
      phoneNumber: row.phone_number,
      message: row.text_body,
      timestamp: new Date(row.timestamp_unix * 1000).toISOString(),
      direction: row.direction === 'outbound' ? 'outgoing' : 'incoming',
    }));
    
    return messages;
  } catch (error) {
    console.error('Error fetching messages from database:', error);
    // Fallback to empty array if there's an error
    return [];
  }
}

export async function GET() {
  try {
    const messages = await getMessages();
    return NextResponse.json({ messages });
  } catch (error) {
    console.error('Error fetching messages:', error);
    return NextResponse.json(
      { error: 'Failed to fetch messages' },
      { status: 500 }
    );
  }
}