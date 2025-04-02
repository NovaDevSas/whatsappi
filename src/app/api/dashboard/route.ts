import { NextResponse } from 'next/server';
import { getConnectionPool } from '@/lib/db';

export async function GET() {
  try {
    // Get database connection
    const pool = await getConnectionPool();
    
    // Query to get enhanced dashboard statistics
    const statsQuery = `
      SELECT
        (SELECT COUNT(DISTINCT contact_id) FROM messages) as total_contacts,
        (SELECT COUNT(*) FROM messages) as total_messages,
        (SELECT COUNT(DISTINCT wa_id) FROM contacts) as active_chats,
        (SELECT COUNT(*) FROM messages WHERE timestamp_unix > extract(epoch from now() - interval '24 hours')) as messages_last_24h,
        (SELECT COUNT(DISTINCT contact_id) FROM messages WHERE timestamp_unix > extract(epoch from now() - interval '7 days')) as active_contacts_7d
    `;
    
    const statsResult = await pool.query(statsQuery);
    const stats = statsResult.rows[0];
    
    // Query to get pending responses (conversations where last message is incoming)
    const pendingQuery = `
      SELECT COUNT(*) as pending_count
      FROM contacts c
      WHERE (
        SELECT direction 
        FROM messages m 
        WHERE m.contact_id = c.id 
        ORDER BY timestamp_unix DESC 
        LIMIT 1
      ) = 'inbound'
    `;
    
    const pendingResult = await pool.query(pendingQuery);
    const pendingCount = pendingResult.rows[0]?.pending_count || 0;
    
    // Query to get recent conversations with more context
    const conversationsQuery = `
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
          SELECT direction
          FROM messages m 
          WHERE m.contact_id = c.id 
          ORDER BY timestamp_unix DESC 
          LIMIT 1
        ) as last_message_direction,
        (
          SELECT COUNT(*) 
          FROM messages m 
          WHERE m.contact_id = c.id AND m.direction = 'inbound'
        ) as unread_count,
        (
          SELECT COUNT(*) 
          FROM messages m 
          WHERE m.contact_id = c.id
        ) as message_count
      FROM 
        contacts c
      ORDER BY 
        last_message_timestamp DESC NULLS LAST
      LIMIT 10
    `;
    
    const conversationsResult = await pool.query(conversationsQuery);
    
    // Query to get hourly message distribution
    const hourlyQuery = `
      SELECT 
        EXTRACT(HOUR FROM to_timestamp(timestamp_unix)) as hour,
        COUNT(*) as count
      FROM 
        messages
      WHERE 
        timestamp_unix > extract(epoch from now() - interval '24 hours')
      GROUP BY 
        hour
      ORDER BY 
        hour
    `;
    
    const hourlyResult = await pool.query(hourlyQuery);
    
    // Query to get message types distribution
    const typesQuery = `
      SELECT
        COUNT(CASE WHEN text_body LIKE '%http%' OR text_body LIKE '%image%' THEN 1 END) as media_count,
        COUNT(CASE WHEN text_body LIKE '%pdf%' OR text_body LIKE '%doc%' THEN 1 END) as document_count,
        COUNT(*) as total_count
      FROM
        messages
    `;
    
    const typesResult = await pool.query(typesQuery);
    const typesData = typesResult.rows[0];
    
    // Transform database results to recent chats objects
    const recentChats = conversationsResult.rows.map(row => ({
      name: row.profile_name || row.phone_number,
      phoneNumber: row.phone_number,
      time: row.last_message_timestamp 
        ? new Date(row.last_message_timestamp * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        : '',
      lastMessage: row.last_message_text || '',
      lastMessageDirection: row.last_message_direction,
      unreadCount: parseInt(row.unread_count) || 0,
      messageCount: parseInt(row.message_count) || 0,
      status: isRecentlyActive(row.last_message_timestamp) ? 'Online' : 'Offline'
    }));
    
    // Transform hourly data
    const hourlyData = {};
    hourlyResult.rows.forEach(row => {
      hourlyData[row.hour] = parseInt(row.count);
    });
    
    // Transform message types data
    const messageTypes = {
      text: parseInt(typesData.total_count) - parseInt(typesData.media_count) - parseInt(typesData.document_count),
      media: parseInt(typesData.media_count) || 0,
      document: parseInt(typesData.document_count) || 0,
      other: 0
    };
    
    // Helper function to determine if a user is recently active
    function isRecentlyActive(timestamp) {
      if (!timestamp) return false;
      const messageTime = timestamp * 1000; // Convert to milliseconds
      const now = Date.now();
      // Consider "online" if active in the last 10 minutes
      return now - messageTime < 10 * 60 * 1000;
    }
    
    // Calculate average response time (simplified)
    // In a real app, you'd calculate this based on pairs of incoming/outgoing messages
    const avgResponseTime = '5m';
    
    return NextResponse.json({
      stats: {
        activeChats: parseInt(stats.active_chats) || 0,
        totalMessages: parseInt(stats.total_messages) || 0,
        contacts: parseInt(stats.total_contacts) || 0,
        messagesLast24h: parseInt(stats.messages_last_24h) || 0,
        activeContacts7d: parseInt(stats.active_contacts_7d) || 0,
        pendingResponses: parseInt(pendingCount) || 0,
        avgResponseTime
      },
      recentChats: recentChats,
      hourlyActivity: hourlyData,
      messageTypes: messageTypes
    });
    
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch dashboard data' },
      { status: 500 }
    );
  }
}