import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { WebSocketProvider } from '@/contexts/WebSocketContext';
import { ConversationProvider } from '@/contexts/ConversationContext';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'WhatsApp API Manager',
  description: 'A modern interface for WhatsApp API interactions',
  viewport: 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=0',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full bg-gray-50">
      <body className={`${inter.className} h-full overflow-x-hidden`}>
        <WebSocketProvider>
          <ConversationProvider>
            <div className="min-h-full flex flex-col">
              {/* Header has been removed */}
              <main className="flex-1 bg-gray-50">
                {children}
              </main>
              {/* Footer has been removed */}
            </div>
          </ConversationProvider>
        </WebSocketProvider>
      </body>
    </html>
  );
}
