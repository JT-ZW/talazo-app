import { useNotificationStore, useAnalysisStore, useFieldsStore } from './store';

/**
 * Adds sample notifications only if there's no real data yet
 * This helps demonstrate the notification system for new users
 */
export function addDemoNotifications() {
  if (typeof window === 'undefined') return;

  const { addNotification, notifications } = useNotificationStore.getState();
  const { analyses } = useAnalysisStore.getState();
  const { fields } = useFieldsStore.getState();

  // Only add demo notifications if:
  // 1. There are no notifications yet AND
  // 2. There are no real analyses (meaning user hasn't uploaded any images yet)
  if (notifications.length > 0 || analyses.length > 0 || fields.length === 0) return;

  console.log('📢 Adding demo notifications (no real data detected)');

  // Get first field for demo
  const demoField = fields[0];

  // Disease alert
  addNotification({
    type: 'disease',
    title: `⚠️ Disease Detected: ${demoField.name}`,
    message: 'Potential disease detected. Upload crop images for detailed analysis.',
    priority: 'high',
    fieldId: demoField.id,
    actionUrl: `/fields/${demoField.id}`,
  });

  // Irrigation reminder
  addNotification({
    type: 'irrigation',
    title: `💧 Irrigation Due: ${demoField.name}`,
    message: `${demoField.cropType} may require irrigation. Check soil moisture levels.`,
    priority: 'medium',
    fieldId: demoField.id,
    actionUrl: `/fields/${demoField.id}`,
  });

  // Weather info
  addNotification({
    type: 'info',
    title: '� Upload Images for Analysis',
    message: 'Upload crop images to get AI-powered health insights and recommendations.',
    priority: 'low',
    actionUrl: '/upload',
  });
}
