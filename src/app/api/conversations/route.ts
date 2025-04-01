import { NextResponse } from 'next/server';
import { Conversation } from '@/types';
import { getConnectionPool } from '@/lib/db';

async function getConversations(): Promise<Conversation[]> {
  try {
    // Get database connection
    const pool = await getConnectionPool();
    
    // Query to get all contacts with their latest message
    const query = `
      SELECT 
        c.id,
        c.wa_id as phone_number,
        c.profile_name,
        (
          SELECT text_body 
          FROM messages m 
          WHERE m.contact_id = c.id 
          ORDER BY timestamp_unix DESC 
          LIMIT 1
        ) as last_message_text,
        (
          SELECT timestamp_unix 
          FROM messages m 
          WHERE m.contact_id = c.id 
          ORDER BY timestamp_unix DESC 
          LIMIT 1
        ) as last_message_timestamp,
        (
          SELECT COUNT(*) 
          FROM messages m 
          WHERE m.contact_id = c.id AND m.direction = 'inbound'
        ) as unread_count
      FROM 
        contacts c
      ORDER BY 
        last_message_timestamp DESC NULLS LAST
    `;
    
    const result = await pool.query(query);
    console.log('Database contacts result:', result.rows);
    
    // Transform database results to Conversation objects
    const conversations: Conversation[] = result.rows.map(row => ({
      id: row.phone_number, // Use wa_id as the conversation ID
      phoneNumber: row.phone_number,
      contact: {
        name: row.profile_name || row.phone_number,
      },
      lastMessage: row.last_message_text ? {
        text: row.last_message_text,
        timestamp: row.last_message_timestamp ? new Date(row.last_message_timestamp * 1000).toISOString() : new Date().toISOString(),
      } : undefined,
      unreadCount: parseInt(row.unread_count) || 0,
    }));
    
    return conversations;
  } catch (error) {
    console.error('Error fetching conversations from database:', error);
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