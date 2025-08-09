'use client';

import React from 'react';
import { Sidebar } from 'lucide-react';
import { useSidebarStore } from '@/storage/sidebarState';
import { User } from '@/types/User';

interface HeaderProps {
  title: string;
  user?: User | null;
  icon?: React.ReactNode;
  children?: React.ReactNode;
  action?: () => void;
}

export default function Header({ title, user, children }: HeaderProps) {
  const { toggle } = useSidebarStore();

  return (
    <div className="fixed top-0 left-0 w-full bg-[#111111] z-10">
      <div className="relative flex items-center justify-between px-4 py-3.5 border-b border-gray-700">
        <div className="flex justify-start">
          <button className="text-gray-200 hover:text-white" onClick={() => toggle()}>
            <Sidebar size={24} />
          </button>
        </div>
        <div className="text-xl font-semibold absolute left-1/2 transform -translate-x-1/2">
          {title}
        </div>
        <div className="flex space-x-4 justify-end">
          {user && user?.username ? (
            <div className="flex items-center space-x-4">
              <span className="text-gray-300 truncate max-w-[70px] md:max-w-none">
                {user.username}
              </span>
            </div>
          ) : (
            <button className="text-gray-200 hover:text-white" onClick={() => {}}>
              {children}
            </button>
          )}
        </div>
      </div>
      <div className="text-center text-sm text-gray-400 mt-1 mb-1">Learning by AI</div>
    </div>
  );
}
