'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store';
import Sidebar from '@/components/Sidebar';
import Navbar from '@/components/Navbar';
import { Toaster } from 'react-hot-toast';

export default function ProtectedLayout({
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
      <Sidebar />
      <div className="lg:ml-64">
        <Navbar />
        <main className="p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
