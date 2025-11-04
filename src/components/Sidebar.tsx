'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  MapPin, 
  Upload, 
  TrendingUp, 
  FileText,
  Settings,
  LogOut,
  Menu,
  X
} from 'lucide-react';
import { useAuthStore } from '@/lib/store';
import { useState } from 'react';
import { cn } from '@/lib/utils';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'My Fields', href: '/fields', icon: MapPin },
  { name: 'Upload & Analyze', href: '/upload', icon: Upload },
  { name: 'Insights', href: '/insights', icon: TrendingUp },
  { name: 'Reports', href: '/reports', icon: FileText },
  { name: 'Settings', href: '/settings', icon: Settings },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuthStore();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    window.location.href = '/login';
  };

  return (
    <>
      {/* Mobile menu button */}
      <button
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-lg bg-[#1E4D2B] text-white"
      >
        {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-40 w-64 bg-[#1E4D2B] text-white transform transition-transform duration-300 ease-in-out lg:translate-x-0',
          isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-center h-16 border-b border-green-800 px-4">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img 
              src="/talazo-logo.png" 
              alt="Talazo Agritech" 
              className="h-12 w-auto object-contain"
            />
          </div>

          {/* User info */}
          <div className="p-4 border-b border-green-800">
            <p className="text-sm font-semibold">{user?.name || 'Guest'}</p>
            <p className="text-xs text-green-300">{user?.email}</p>
            <div className="mt-2">
              <span className="inline-flex items-center px-2 py-1 rounded text-xs bg-[#F6A623] text-[#1E4D2B] font-medium">
                {user?.subscriptionTier?.toUpperCase() || 'FREE'}
              </span>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto p-4 space-y-1">
            {navigation.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={cn(
                    'flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors',
                    isActive
                      ? 'bg-[#F6A623] text-[#1E4D2B] font-semibold'
                      : 'text-green-100 hover:bg-green-800'
                  )}
                >
                  <item.icon size={20} />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>

          {/* Logout button */}
          <div className="p-4 border-t border-green-800">
            <button
              onClick={handleLogout}
              className="flex items-center space-x-3 w-full px-4 py-3 rounded-lg text-green-100 hover:bg-red-900 transition-colors"
            >
              <LogOut size={20} />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Overlay for mobile */}
      {isMobileMenuOpen && (
        <div
          onClick={() => setIsMobileMenuOpen(false)}
          className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
        />
      )}
    </>
  );
}
