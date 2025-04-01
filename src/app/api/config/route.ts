import { NextRequest, NextResponse } from 'next/server';

// GET endpoint to retrieve configuration (without exposing sensitive values)
export async function GET() {
  return NextResponse.json({
    hasConfig: Boolean(process.env.WHATSAPP_API_KEY),
    // Only return status, not actual values for security
  });
}

// POST endpoint to use the configuration (server-side only)
export async function POST(request: NextRequest) {
  try {
    const { action } = await request.json();
    
    // Validate configuration exists
    if (!process.env.WHATSAPP_API_KEY || 
        !process.env.WHATSAPP_PHONE_NUMBER_ID || 
        !process.env.WHATSAPP_ACCESS_TOKEN) {
      return NextResponse.json(
        { error: 'WhatsApp API configuration is incomplete' },
        { status: 500 }
      );
    }
    
    // Example of a test action
    if (action === 'test') {
      // Here you could make a test call to WhatsApp API
      // using the environment variables
      return NextResponse.json({ success: true, message: 'Configuration is valid' });
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error processing config request:', error);
    return NextResponse.json(
      { error: 'Failed to process configuration request' },
      { status: 500 }
    );
  }
}