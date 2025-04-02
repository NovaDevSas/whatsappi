import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';

interface SidebarProps {
  activeView: 'chat' | 'dashboard';
  onViewChange: (view: 'chat' | 'dashboard') => void;
}

export default function Sidebar({ activeView, onViewChange }: SidebarProps) {
  const menuItems = [
    { id: 'dashboard', icon: 'M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z', label: 'Dashboard' },
    { id: 'messages', icon: 'M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z', label: 'Messages' },
    { id: 'calendar', icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z', label: 'Calendar' },
    { id: 'settings', icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z', label: 'Settings' },
  ];

  return (
    <div className="w-20 bg-purple-600 text-white flex flex-col items-center py-6 h-screen">
      {/* Logo */}
      <div className="mb-10">
        <div className="h-10 w-10 rounded-full bg-white text-purple-600 flex items-center justify-center font-bold text-xl">
          N
        </div>
      </div>
      
      {/* Navigation */}
      <nav className="flex-1 w-full">
        <ul className="space-y-6">
          <li className="flex justify-center">
            <button
              onClick={() => onViewChange('dashboard')}
              className={`p-3 rounded-xl transition-colors ${
                activeView === 'dashboard' 
                  ? 'bg-white text-purple-600' 
                  : 'text-white hover:bg-purple-500'
              }`}
              title="Dashboard"
            >
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                className="h-6 w-6" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d={menuItems[0].icon} 
                />
              </svg>
            </button>
          </li>
          <li className="flex justify-center">
            <button
              onClick={() => onViewChange('chat')}
              className={`p-3 rounded-xl transition-colors ${
                activeView === 'chat' 
                  ? 'bg-white text-purple-600' 
                  : 'text-white hover:bg-purple-500'
              }`}
              title="Messages"
            >
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                className="h-6 w-6" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d={menuItems[1].icon} 
                />
              </svg>
            </button>
          </li>
          {menuItems.slice(2).map((item) => (
            <li key={item.id} className="flex justify-center">
              <button
                className="p-3 text-white hover:bg-purple-500 rounded-xl transition-colors"
                title={item.label}
              >
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  className="h-6 w-6" 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d={item.icon} 
                  />
                </svg>
              </button>
            </li>
          ))}
        </ul>
      </nav>
      
      {/* Logout */}
      <button 
        className="p-3 text-white hover:bg-purple-500 rounded-xl transition-colors mt-6"
        title="Logout"
      >
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          className="h-6 w-6" 
          fill="none" 
          viewBox="0 0 24 24" 
          stroke="currentColor"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={2} 
            d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" 
          />
        </svg>
      </button>
    </div>
  );
}