'use client';

import { Search, Cloud, CloudRain, Sun } from 'lucide-react';
import { mockWeatherData } from '@/lib/mockData';
import NotificationCenter from './NotificationCenter';

export default function Navbar() {
  const weather = mockWeatherData.current;

  const getWeatherIcon = () => {
    switch (weather.condition) {
      case 'Sunny':
        return <Sun size={20} className="text-amber-500" />;
      case 'Rainy':
        return <CloudRain size={20} className="text-blue-500" />;
      default:
        return <Cloud size={20} className="text-gray-500" />;
    }
  };

  return (
    <nav className="bg-white border-b border-gray-200 h-16 flex items-center justify-between px-6 sticky top-0 z-30">
      {/* Search bar */}
      <div className="flex-1 max-w-lg">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Search fields, reports..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1E4D2B] focus:border-transparent"
          />
        </div>
      </div>

      {/* Right section */}
      <div className="flex items-center space-x-6 ml-6">
        {/* Weather widget */}
        <div className="hidden md:flex items-center space-x-2 px-3 py-2 bg-gray-50 rounded-lg">
          {getWeatherIcon()}
          <div className="text-sm">
            <p className="font-semibold text-gray-900">{weather.temp}°C</p>
            <p className="text-xs text-gray-500">{weather.condition}</p>
          </div>
        </div>

        {/* Notifications */}
        <NotificationCenter />

        {/* User avatar */}
        <div className="w-10 h-10 rounded-full bg-[#1E4D2B] flex items-center justify-center text-white font-semibold">
          JM
        </div>
      </div>
    </nav>
  );
}
