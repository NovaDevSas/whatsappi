import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'WhatsApp API Manager',
  description: 'A modern interface for WhatsApp API interactions',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full bg-gray-50">
      <body className={`${inter.className} h-full`}>
        <div className="min-h-full flex flex-col">
          <header className="bg-white shadow-sm">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex justify-between h-16 items-center">
                <h1 className="text-xl font-bold text-gray-900">
                  WhatsApp API Manager
                </h1>
                <nav className="flex space-x-8">
                  <a href="/" className="text-gray-500 hover:text-gray-700">
                    Conversations
                  </a>
                  <a href="/config" className="text-gray-500 hover:text-gray-700">
                    Configuration
                  </a>
                </nav>
              </div>
            </div>
          </header>
          <main className="flex-1 bg-gray-50">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
