'use client';

import { useAuthStore } from '@/lib/store';
import { User, MapPin, Bell, Shield } from 'lucide-react';

export default function SettingsPage() {
  const { user, updateProfile } = useAuthStore();

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-600 mt-1">Manage your account and preferences</p>
      </div>

      {/* Profile Section */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center mb-4">
          <User className="text-[#1E4D2B] mr-2" size={24} />
          <h2 className="text-xl font-bold text-gray-900">Profile Information</h2>
        </div>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
            <input
              type="text"
              value={user?.name || ''}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1E4D2B]"
              readOnly
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
            <input
              type="email"
              value={user?.email || ''}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50"
              readOnly
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Subscription Tier</label>
            <div className="px-4 py-2 bg-[#F6A623] text-white rounded-lg inline-block font-semibold">
              {user?.subscriptionTier?.toUpperCase() || 'FREE'}
            </div>
          </div>
        </div>
      </div>

      {/* Notifications */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center mb-4">
          <Bell className="text-[#1E4D2B] mr-2" size={24} />
          <h2 className="text-xl font-bold text-gray-900">Notifications</h2>
        </div>
        
        <div className="space-y-3">
          <label className="flex items-center">
            <input type="checkbox" defaultChecked className="rounded border-gray-300 text-[#1E4D2B]" />
            <span className="ml-3 text-gray-700">Email notifications for critical issues</span>
          </label>
          
          <label className="flex items-center">
            <input type="checkbox" defaultChecked className="rounded border-gray-300 text-[#1E4D2B]" />
            <span className="ml-3 text-gray-700">Weekly summary reports</span>
          </label>
          
          <label className="flex items-center">
            <input type="checkbox" className="rounded border-gray-300 text-[#1E4D2B]" />
            <span className="ml-3 text-gray-700">SMS alerts</span>
          </label>
        </div>
      </div>

      {/* Location */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center mb-4">
          <MapPin className="text-[#1E4D2B] mr-2" size={24} />
          <h2 className="text-xl font-bold text-gray-900">Farm Location</h2>
        </div>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Farm Name</label>
            <input
              type="text"
              placeholder="e.g., Green Valley Farm"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1E4D2B]"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
            <input
              type="text"
              placeholder="e.g., Harare, Zimbabwe"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1E4D2B]"
            />
          </div>
        </div>
      </div>

      {/* Privacy */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center mb-4">
          <Shield className="text-[#1E4D2B] mr-2" size={24} />
          <h2 className="text-xl font-bold text-gray-900">Privacy & Security</h2>
        </div>
        
        <div className="space-y-4">
          <button className="text-[#1E4D2B] hover:underline font-medium">
            Change Password
          </button>
          
          <div className="pt-4 border-t border-gray-200">
            <button className="text-red-600 hover:underline font-medium">
              Delete Account
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
