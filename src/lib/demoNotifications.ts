import { useNotificationStore } from './store';

/**
 * Adds sample notifications to demonstrate the notification system
 * Call this function once on app initialization
 */
export function addDemoNotifications() {
  if (typeof window === 'undefined') return;

  const { addNotification, notifications } = useNotificationStore.getState();

  // Only add demo notifications if there are no notifications yet
  if (notifications.length > 0) return;

  // Disease alert
  addNotification({
    type: 'disease',
    title: '⚠️ Disease Detected: North Field',
    message: 'Maize Streak Virus detected with 87% confidence. Immediate action recommended.',
    priority: 'high',
    fieldId: 'field-1',
    actionUrl: '/fields/field-1',
  });

  // Irrigation reminder
  addNotification({
    type: 'irrigation',
    title: '💧 Irrigation Due: South Field',
    message: 'Tobacco requires irrigation (45 days since planting).',
    priority: 'medium',
    fieldId: 'field-2',
    actionUrl: '/fields/field-2',
  });

  // Harvest notification
  addNotification({
    type: 'harvest',
    title: '🌾 Harvest in 2 Weeks: East Field',
    message: 'Wheat will be ready for harvest in approximately 14 days.',
    priority: 'medium',
    fieldId: 'field-3',
    actionUrl: '/fields/field-3',
  });

  // Weather alert
  addNotification({
    type: 'weather',
    title: '🌧️ Heavy Rain Expected',
    message: 'Heavy rainfall forecasted for tomorrow. Check drainage systems.',
    priority: 'high',
    actionUrl: '/dashboard',
  });

  // Info notification
  addNotification({
    type: 'info',
    title: '📊 Weekly Report Available',
    message: 'Your crop health summary for the week is ready to view.',
    priority: 'low',
    actionUrl: '/reports',
  });
}
