import { NextResponse } from 'next/server';

// This is a mock function - in a real app, you would fetch from your database
// or from the WhatsApp API
async function getMessages() {
  // Mock data
  return [
    {
      id: '1',
      phoneNumber: '+1234567890',
      message: 'Hello, how can I help you?',
      timestamp: new Date().toISOString(),
      direction: 'outgoing',
    },
    {
      id: '2',
      phoneNumber: '+1234567890',
      message: 'I have a question about your product',
      timestamp: new Date(Date.now() - 5 * 60000).toISOString(),
      direction: 'incoming',
    },
    // Add more mock messages as needed
  ];
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