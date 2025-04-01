import { NextRequest, NextResponse } from 'next/server';
import { getConnectionPool } from '@/lib/db';
import { Message } from '@/types';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // The issue is here - params doesn't need to be awaited, but we need to handle it properly
    const { id } = params; // Destructure directly instead of using params?.id
    const conversationId = id;
    
    if (!conversationId) {
      return NextResponse.json(
        { error: 'Conversation ID is required' },
        { status: 400 }
      );
    }
    
    // Get database connection
    const pool = await getConnectionPool();
    
    // Query to get messages for a specific contact
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
      WHERE 
        c.wa_id = $1
      ORDER BY 
        m.timestamp_unix ASC
    `;
    
    const result = await pool.query(query, [conversationId]);
    console.log(`Found ${result.rows.length} messages for conversation ${conversationId}`);
    
    // Transform database results to Message objects
    const messages: Message[] = result.rows.map((row, index) => ({
      id: row.message_wamid ? `${row.message_wamid}-${index}` : `${row.id}-${index}`, // Ensure unique IDs
      phoneNumber: row.phone_number,
      message: row.text_body,
      timestamp: new Date(row.timestamp_unix * 1000).toISOString(),
      direction: row.direction === 'outbound' ? 'outgoing' : 'incoming',
    }));
    
    return NextResponse.json({ messages });
  } catch (error) {
    console.error('Error fetching conversation messages:', error);
    return NextResponse.json(
      { error: 'Failed to fetch conversation messages' },
      { status: 500 }
    );
  }
}