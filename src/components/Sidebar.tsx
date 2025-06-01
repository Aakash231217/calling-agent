import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Users, MessageSquare, Phone, Settings } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SidebarProps {
  className?: string;
}

export function Sidebar({ className }: SidebarProps) {
  const location = useLocation();
  
  const isActive = (path: string) => {
    return location.pathname === path || location.pathname.startsWith(`${path}/`);
  };

  const navItems = [
    { name: 'Dashboard', icon: Home, path: '/dashboard' },
    { name: 'Agents', icon: Users, path: '/agents' },
    { name: 'Conversations', icon: MessageSquare, path: '/conversations' },
    { name: 'Telephony', icon: Phone, path: '/telephony' },
  ];

  return (
    <div className={cn('pb-12 h-full', className)}>
      <div className="space-y-4 py-4">
        <div className="px-4 py-2">
          <h2 className="mb-2 px-2 text-lg font-semibold tracking-tight">
            Main Navigation
          </h2>
          <div className="space-y-1">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  'flex items-center rounded-md px-3 py-2 text-sm font-medium transition-colors',
                  isActive(item.path) 
                    ? 'bg-blue-100 text-blue-900 dark:bg-blue-900 dark:text-blue-50' 
                    : 'hover:bg-blue-50 hover:text-blue-900 dark:hover:bg-blue-800 dark:hover:text-blue-50'
                )}
              >
                <item.icon className="mr-2 h-4 w-4" />
                <span>{item.name}</span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
