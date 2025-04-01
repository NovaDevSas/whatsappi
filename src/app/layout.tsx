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
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
      </head>
      <body className={inter.className}>
        <div className="min-h-screen flex flex-col">
          <header className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md">
            <div className="container mx-auto px-4 py-3">
              <div className="flex items-center justify-between">
                <h1 className="text-xl font-bold">WhatsApp API Manager</h1>
                <div className="flex items-center space-x-4">
                  <span className="inline-flex items-center px-2 py-1 rounded-full bg-green-500 text-xs font-medium">
                    <span className="w-2 h-2 mr-1 rounded-full bg-white"></span>
                    Conectado
                  </span>
                </div>
              </div>
            </div>
          </header>
          <main className="flex-grow container mx-auto px-4 py-4">
            {children}
          </main>
          <footer className="bg-gray-50 border-t text-center py-3 text-sm text-gray-500">
            <div className="container mx-auto px-4">
              WhatsApp API Manager &copy; {new Date().getFullYear()}
            </div>
          </footer>
        </div>
      </body>
    </html>
  );
}
