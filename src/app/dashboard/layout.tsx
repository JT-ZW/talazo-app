'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store';
import Sidebar from '@/components/Sidebar';
import Navbar from '@/components/Navbar';
import ChatInterface from '@/components/ChatInterface';
import { SupabaseSync } from '@/components/SupabaseSync';
import { Toaster } from 'react-hot-toast';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, router]);

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Toaster position="top-right" />
      <SupabaseSync />
      <Sidebar />
      <div className="lg:ml-64">
        <Navbar />
        <main className="p-6">
          {children}
        </main>
      </div>
      {/* Floating AI Assistant */}
      <ChatInterface position="floating" initiallyMinimized={true} />
    </div>
  );
}
