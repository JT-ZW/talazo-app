'use client';

import { useEffect } from 'react';
import { initializeNotificationTriggers, checkWeatherAlerts } from '@/lib/notificationTriggers';
import { addDemoNotifications } from '@/lib/demoNotifications';

export default function NotificationInitializer() {
  useEffect(() => {
    // Add demo notifications on first load
    addDemoNotifications();

    // Initialize notification checking
    const cleanup = initializeNotificationTriggers();

    // Check weather alerts every hour
    const weatherInterval = setInterval(() => {
      checkWeatherAlerts();
    }, 60 * 60 * 1000); // 1 hour

    // Initial weather check (commented out to avoid excessive demo notifications)
    // checkWeatherAlerts();

    return () => {
      cleanup?.();
      clearInterval(weatherInterval);
    };
  }, []);

  return null; // This component doesn't render anything
}
