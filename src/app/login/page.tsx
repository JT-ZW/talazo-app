'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/lib/store';
import toast, { Toaster } from 'react-hot-toast';
import { Mail, Lock, Loader2 } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { login } = useAuthStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const success = await login(email, password);
      if (success) {
        toast.success('Welcome back!');
        router.push('/dashboard');
      } else {
        toast.error('Invalid credentials');
      }
    } catch (error) {
      toast.error('An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-600 via-green-600 to-teal-600 flex items-center justify-center p-4 relative overflow-hidden">
      <Toaster position="top-right" />
      
      {/* Decorative elements */}
      <div className="absolute top-10 left-10 w-32 h-32 border-2 border-white/20 rounded-full"></div>
      <div className="absolute bottom-20 right-20 w-20 h-20 border-2 border-white/20 rounded-full"></div>
      <div className="absolute top-1/4 right-1/4 w-2 h-2 bg-white/40 rounded-full"></div>
      <div className="absolute bottom-1/3 left-1/4 w-2 h-2 bg-white/40 rounded-full"></div>
      
      {/* Decorative pattern dots */}
      <div className="absolute top-16 right-32">
        <div className="grid grid-cols-3 gap-1">
          {[...Array(9)].map((_, i) => (
            <div key={i} className="w-1.5 h-1.5 bg-white/30 rounded-full"></div>
          ))}
        </div>
      </div>

      {/* Organic shapes */}
      <svg className="absolute top-20 left-16 w-24 h-24 text-white/10" viewBox="0 0 100 100">
        <path d="M20,50 Q40,20 60,50 T100,50" stroke="currentColor" strokeWidth="2" fill="none"/>
        <path d="M20,60 Q40,30 60,60 T100,60" stroke="currentColor" strokeWidth="2" fill="none"/>
      </svg>

      <div className="w-full max-w-6xl grid lg:grid-cols-2 gap-8 items-center z-10">
        {/* Left side - Welcome section */}
        <div className="text-white space-y-6 px-8 hidden lg:block">
          <div className="space-y-4">
            {/* Logo */}
            <div className="mb-8 inline-block bg-white/95 backdrop-blur-sm rounded-2xl p-6 shadow-lg">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img 
                src="/talazo-logo.png" 
                alt="Talazo Agritech" 
                className="h-20 w-auto object-contain"
              />
            </div>
            
            <h1 className="text-5xl font-bold leading-tight">
              Welcome back!
            </h1>
            <p className="text-lg text-green-100">
              You can sign in to access with your existing account.
            </p>
          </div>

          {/* Decorative pattern */}
          <div className="relative pt-8">
            <svg className="w-48 h-32 opacity-30" viewBox="0 0 200 100">
              <path d="M10,50 Q50,10 90,50 T170,50" stroke="white" strokeWidth="3" fill="none" strokeLinecap="round"/>
              <path d="M10,60 Q50,20 90,60 T170,60" stroke="white" strokeWidth="3" fill="none" strokeLinecap="round"/>
              <path d="M10,70 Q50,30 90,70 T170,70" stroke="white" strokeWidth="3" fill="none" strokeLinecap="round"/>
            </svg>
          </div>
        </div>

        {/* Right side - Login form */}
        <div className="bg-white rounded-3xl shadow-2xl p-8 lg:p-12 w-full max-w-md mx-auto">
          {/* Mobile logo */}
          <div className="lg:hidden mb-6 text-center">
            <div className="inline-block bg-white/10 backdrop-blur-sm rounded-2xl p-4">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img 
                src="/talazo-logo.png" 
                alt="Talazo Agritech" 
                className="h-16 w-auto object-contain mx-auto"
              />
            </div>
          </div>

          <div className="mb-8">
            <h2 className="text-3xl font-bold text-gray-800 mb-2">Sign In</h2>
            <p className="text-gray-500">Enter your credentials to continue</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email field */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                <Mail className="inline mr-2" size={16} />
                Username or email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                placeholder="Enter your email"
              />
            </div>

            {/* Password field */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                <Lock className="inline mr-2" size={16} />
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                placeholder="Enter your password"
              />
            </div>

            {/* Remember me and Forgot password */}
            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center text-gray-600 cursor-pointer">
                <input 
                  type="checkbox" 
                  className="rounded border-gray-300 text-emerald-600 focus:ring-emerald-500 mr-2" 
                />
                Remember me
              </label>
              <Link href="#" className="text-emerald-600 hover:text-emerald-700 font-medium">
                Forgot password?
              </Link>
            </div>

            {/* Sign in button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 text-white py-3.5 rounded-xl font-semibold hover:from-emerald-700 hover:to-teal-700 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {isLoading ? (
                <>
                  <Loader2 className="animate-spin mr-2" size={20} />
                  Signing in...
                </>
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          {/* Sign up link */}
          <div className="mt-8 text-center">
            <p className="text-gray-600">
              New here?{' '}
              <Link href="/signup" className="text-emerald-600 hover:text-emerald-700 font-semibold hover:underline">
                Create an Account
              </Link>
            </p>
          </div>
        </div>
      </div>

      {/* Mobile welcome text */}
      <div className="lg:hidden absolute top-8 left-0 right-0 text-center text-white px-4 z-0">
        <h1 className="text-2xl font-bold mb-2">Welcome back!</h1>
        <p className="text-sm text-green-100">Sign in to access your account</p>
      </div>
    </div>
  );
}
