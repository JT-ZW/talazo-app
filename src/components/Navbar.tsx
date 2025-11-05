'use client';

import { Search, Cloud, CloudRain, Sun, Loader2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import { fetchWeatherData, type WeatherData } from '@/lib/weatherService';
import { CONFIG } from '@/lib/config';
import NotificationCenter from './NotificationCenter';

export default function Navbar() {
  const [weather, setWeather] = useState<WeatherData['current'] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [locationName, setLocationName] = useState<string>('');

  useEffect(() => {
    async function loadWeather() {
      try {
        // Get user's location first
        const { getUserLocation } = await import('@/lib/weatherService');
        const location = await getUserLocation();
        
        // Fetch weather for user's location
        const data = await fetchWeatherData(location.lat, location.lon);
        setWeather(data.current);
        
        // Get location name from reverse geocoding
        if (location.city) {
          setLocationName(location.city);
        } else {
          // Fetch location name from coordinates
          const locationData = await fetch(
            `https://api.openweathermap.org/geo/1.0/reverse?lat=${location.lat}&lon=${location.lon}&limit=1&appid=${process.env.NEXT_PUBLIC_OPENWEATHER_API_KEY}`
          );
          if (locationData.ok) {
            const [place] = await locationData.json();
            setLocationName(place?.name || 'Your Location');
          }
        }
      } catch (error) {
        console.error('Failed to load weather:', error);
      } finally {
        setIsLoading(false);
      }
    }
    loadWeather();
  }, []);

  const getWeatherIcon = () => {
    if (!weather) return <Cloud size={20} className="text-gray-400" />;
    
    switch (weather.condition) {
      case 'Clear':
      case 'Sunny':
        return <Sun size={20} className="text-amber-500" />;
      case 'Rain':
      case 'Drizzle':
      case 'Thunderstorm':
        return <CloudRain size={20} className="text-blue-500" />;
      case 'Clouds':
        return <Cloud size={20} className="text-gray-500" />;
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
          {isLoading ? (
            <Loader2 size={20} className="text-gray-400 animate-spin" />
          ) : (
            getWeatherIcon()
          )}
          <div className="text-sm">
            {isLoading ? (
              <>
                <p className="font-semibold text-gray-400">--°C</p>
                <p className="text-xs text-gray-400">Loading...</p>
              </>
            ) : weather ? (
              <>
                <p className="font-semibold text-gray-900">{weather.temp}°C</p>
                <p className="text-xs text-gray-500 truncate max-w-[100px]" title={locationName || weather.condition}>
                  {locationName || weather.condition}
                </p>
                {!CONFIG.USE_REAL_WEATHER && (
                  <span className="text-xs text-orange-500 font-medium">DEMO</span>
                )}
              </>
            ) : (
              <>
                <p className="font-semibold text-gray-400">--°C</p>
                <p className="text-xs text-gray-400">Unavailable</p>
              </>
            )}
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
