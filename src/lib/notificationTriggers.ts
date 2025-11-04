import { useFieldsStore, useAnalysisStore, useNotificationStore } from './store';
import type { AnalysisResult } from './store';

export function initializeNotificationTriggers() {
  if (typeof window === 'undefined') return;

  // Check for notifications every 5 minutes
  const checkInterval = setInterval(() => {
    checkFieldConditions();
    checkIrrigationNeeds();
    checkHarvestSchedule();
  }, 5 * 60 * 1000); // 5 minutes

  // Initial check on mount
  checkFieldConditions();
  checkIrrigationNeeds();
  checkHarvestSchedule();

  return () => clearInterval(checkInterval);
}

function checkFieldConditions() {
  const { fields } = useFieldsStore.getState();
  const { analyses } = useAnalysisStore.getState();
  const { addNotification, notifications } = useNotificationStore.getState();

  fields.forEach((field) => {
    // Check for recent disease detection
    const recentAnalyses = analyses
      .filter((a: AnalysisResult) => a.fieldId === field.id)
      .sort((a: AnalysisResult, b: AnalysisResult) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    if (recentAnalyses.length > 0) {
      const latestAnalysis = recentAnalyses[0];
      
      // Disease detection alert
      if (latestAnalysis.disease && latestAnalysis.disease.detected) {
        
        if (latestAnalysis.disease.severity === 'High' || latestAnalysis.disease.severity === 'Critical') {
          // Check if we already sent this notification recently (within 24 hours)
          const recentNotification = notifications.find(
            n => n.fieldId === field.id && 
            n.type === 'disease' &&
            new Date(n.timestamp).getTime() > Date.now() - 24 * 60 * 60 * 1000
          );

          if (!recentNotification) {
            addNotification({
              type: 'disease',
              title: `⚠️ Disease Detected: ${field.name}`,
              message: `Critical: ${latestAnalysis.disease.type} detected. Immediate action recommended.`,
              priority: 'high',
              fieldId: field.id,
              actionUrl: `/fields/${field.id}`,
            });
          }
        }
      }

      // Low health score alert (based on disease affectedArea)
      if (latestAnalysis.disease.detected && latestAnalysis.disease.affectedArea > 40) {
        const recentHealthNotification = notifications.find(
          n => n.fieldId === field.id && 
          n.title.includes('Low Health Score') &&
          new Date(n.timestamp).getTime() > Date.now() - 48 * 60 * 60 * 1000 // 48 hours
        );

        if (!recentHealthNotification) {
          addNotification({
            type: 'info',
            title: `Large Affected Area: ${field.name}`,
            message: `Field has ${latestAnalysis.disease.affectedArea}% affected area. Consider investigation.`,
            priority: 'medium',
            fieldId: field.id,
            actionUrl: `/fields/${field.id}`,
          });
        }
      }
    }
  });
}

function checkIrrigationNeeds() {
  const { fields } = useFieldsStore.getState();
  const { addNotification, notifications } = useNotificationStore.getState();

  const now = new Date();

  fields.forEach((field) => {
    const plantingDate = new Date(field.plantingDate);
    const daysSincePlanting = Math.floor((now.getTime() - plantingDate.getTime()) / (1000 * 60 * 60 * 24));

    // Irrigation schedule based on days since planting
    // Early stage: every 3 days, Mid stage: every 5 days, Late stage: every 7 days
    let irrigationCycle = 7; // default
    if (daysSincePlanting < 30) irrigationCycle = 3;
    else if (daysSincePlanting < 60) irrigationCycle = 5;

    // Check last irrigation notification
    const lastIrrigationNotif = notifications
      .filter(n => n.fieldId === field.id && n.type === 'irrigation')
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())[0];

    const daysSinceLastNotif = lastIrrigationNotif
      ? Math.floor((now.getTime() - new Date(lastIrrigationNotif.timestamp).getTime()) / (1000 * 60 * 60 * 24))
      : irrigationCycle + 1;

    if (daysSinceLastNotif >= irrigationCycle) {
      addNotification({
        type: 'irrigation',
        title: `💧 Irrigation Due: ${field.name}`,
        message: `${field.cropType} requires irrigation (${daysSincePlanting} days since planting).`,
        priority: 'medium',
        fieldId: field.id,
        actionUrl: `/fields/${field.id}`,
      });
    }
  });
}

function checkHarvestSchedule() {
  const { fields } = useFieldsStore.getState();
  const { addNotification, notifications } = useNotificationStore.getState();

  const now = new Date();

  fields.forEach((field) => {
    const plantingDate = new Date(field.plantingDate);
    const daysSincePlanting = Math.floor((now.getTime() - plantingDate.getTime()) / (1000 * 60 * 60 * 24));

    // Typical crop maturity periods (days)
    const maturityPeriods: Record<string, number> = {
      'Maize': 120,
      'Wheat': 110,
      'Tobacco': 90,
      'Cotton': 150,
      'Soybean': 100,
      'Tomato': 75,
      'Potato': 90,
    };

    const maturityDays = maturityPeriods[field.cropType] || 100;
    const daysUntilHarvest = maturityDays - daysSincePlanting;

    // Alert 14 days before harvest
    if (daysUntilHarvest === 14) {
      const recentHarvestNotif = notifications.find(
        n => n.fieldId === field.id && 
        n.type === 'harvest' &&
        n.title.includes('2 Weeks') &&
        new Date(n.timestamp).getTime() > Date.now() - 48 * 60 * 60 * 1000
      );

      if (!recentHarvestNotif) {
        addNotification({
          type: 'harvest',
          title: `🌾 Harvest in 2 Weeks: ${field.name}`,
          message: `${field.cropType} will be ready for harvest in approximately 14 days.`,
          priority: 'medium',
          fieldId: field.id,
          actionUrl: `/fields/${field.id}`,
        });
      }
    }

    // Alert 3 days before harvest
    if (daysUntilHarvest === 3) {
      const recentHarvestNotif = notifications.find(
        n => n.fieldId === field.id && 
        n.type === 'harvest' &&
        n.title.includes('3 Days') &&
        new Date(n.timestamp).getTime() > Date.now() - 24 * 60 * 60 * 1000
      );

      if (!recentHarvestNotif) {
        addNotification({
          type: 'harvest',
          title: `⚠️ Harvest in 3 Days: ${field.name}`,
          message: `${field.cropType} will be ready for harvest soon. Prepare equipment and labor.`,
          priority: 'high',
          fieldId: field.id,
          actionUrl: `/fields/${field.id}`,
        });
      }
    }

    // Alert on harvest day
    if (daysUntilHarvest === 0) {
      const recentHarvestNotif = notifications.find(
        n => n.fieldId === field.id && 
        n.type === 'harvest' &&
        n.title.includes('Ready Now') &&
        new Date(n.timestamp).getTime() > Date.now() - 24 * 60 * 60 * 1000
      );

      if (!recentHarvestNotif) {
        addNotification({
          type: 'harvest',
          title: `✅ Harvest Ready: ${field.name}`,
          message: `${field.cropType} has reached maturity and is ready for harvest!`,
          priority: 'high',
          fieldId: field.id,
          actionUrl: `/fields/${field.id}`,
        });
      }
    }
  });
}

// Weather-based notifications (mock weather data)
export function checkWeatherAlerts() {
  const { addNotification, notifications } = useNotificationStore.getState();

  // Simulate weather check (in production, this would call a weather API)
  const mockWeatherConditions = [
    { condition: 'heavy_rain', probability: 0.1 },
    { condition: 'drought', probability: 0.05 },
    { condition: 'frost', probability: 0.03 },
  ];

  mockWeatherConditions.forEach((weather) => {
    if (Math.random() < weather.probability) {
      const recentWeatherNotif = notifications.find(
        n => n.type === 'weather' &&
        n.title.includes(weather.condition) &&
        new Date(n.timestamp).getTime() > Date.now() - 6 * 60 * 60 * 1000 // 6 hours
      );

      if (!recentWeatherNotif) {
        const messages: Record<string, { title: string; message: string }> = {
          heavy_rain: {
            title: '🌧️ Heavy Rain Alert',
            message: 'Heavy rainfall expected in the next 24 hours. Check drainage systems.',
          },
          drought: {
            title: '☀️ Drought Warning',
            message: 'Extended dry period forecasted. Plan irrigation schedules accordingly.',
          },
          frost: {
            title: '❄️ Frost Warning',
            message: 'Frost expected tonight. Protect sensitive crops.',
          },
        };

        addNotification({
          type: 'weather',
          title: messages[weather.condition].title,
          message: messages[weather.condition].message,
          priority: 'high',
          actionUrl: '/dashboard',
        });
      }
    }
  });
}
