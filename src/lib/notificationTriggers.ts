import { useFieldsStore, useAnalysisStore, useNotificationStore } from './store';
import type { AnalysisResult } from './store';
import { fetchWeatherData, analyzeWeatherAlerts } from './weatherService';

export function initializeNotificationTriggers() {
  if (typeof window === 'undefined') return;

  // Check for notifications every 5 minutes
  const checkInterval = setInterval(() => {
    checkFieldConditions();
    checkIrrigationNeeds();
    checkHarvestSchedule();
    checkWeatherAlerts(); // Added weather checks
    checkNutrientLevels(); // Added nutrient checks
  }, 5 * 60 * 1000); // 5 minutes

  // Initial checks on mount
  checkFieldConditions();
  checkIrrigationNeeds();
  checkHarvestSchedule();
  checkWeatherAlerts();
  checkNutrientLevels();

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

// Weather-based notifications using real API data
export async function checkWeatherAlerts() {
  const { fields } = useFieldsStore.getState();
  const { addNotification, notifications } = useNotificationStore.getState();

  try {
    // Get user's location (default to Harare, Zimbabwe)
    const location = { lat: -17.8252, lon: 31.0335 }; // Harare coordinates
    
    // Fetch real weather data for user's location
    const weatherData = await fetchWeatherData(location.lat, location.lon);
    const alerts = analyzeWeatherAlerts(weatherData);

    // Add notifications for each weather alert
    alerts.forEach((alert) => {
      // Check if we already sent this type of alert recently (within 6 hours)
      const recentWeatherNotif = notifications.find(
        n => n.type === 'weather' &&
        n.title.includes(alert.type) &&
        new Date(n.timestamp).getTime() > Date.now() - 6 * 60 * 60 * 1000
      );

      if (!recentWeatherNotif) {
        addNotification({
          type: 'weather',
          title: alert.title,
          message: alert.message,
          priority: alert.severity,
          actionUrl: '/dashboard',
        });
      }
    });

    // Add irrigation recommendations based on weather
    const { current, forecast } = weatherData;
    
    // Check for upcoming dry period
    const nextDays = forecast.slice(0, 3);
    const dryDaysCount = nextDays.filter(day => day.precipitation < 10).length;
    
    if (dryDaysCount === 3 && current.humidity < 50) {
      const recentDryNotif = notifications.find(
        n => n.type === 'irrigation' &&
        n.title.includes('Dry Period') &&
        new Date(n.timestamp).getTime() > Date.now() - 24 * 60 * 60 * 1000
      );

      if (!recentDryNotif && fields.length > 0) {
        addNotification({
          type: 'irrigation',
          title: '☀️ Dry Period Ahead',
          message: `No significant rainfall expected for 3 days. Consider irrigation for ${fields.length} field(s).`,
          priority: 'medium',
          actionUrl: '/fields',
        });
      }
    }

    // Check for good planting conditions
    if (current.temp >= 20 && current.temp <= 28 && current.humidity >= 50 && current.humidity <= 70) {
      const recentPlantingNotif = notifications.find(
        n => n.type === 'info' &&
        n.title.includes('Planting Conditions') &&
        new Date(n.timestamp).getTime() > Date.now() - 48 * 60 * 60 * 1000
      );

      if (!recentPlantingNotif) {
        addNotification({
          type: 'info',
          title: '🌱 Ideal Planting Conditions',
          message: `Temperature (${current.temp}°C) and humidity (${current.humidity}%) are ideal for planting.`,
          priority: 'low',
          actionUrl: '/fields',
        });
      }
    }

  } catch (error) {
    console.error('Failed to check weather alerts:', error);
  }
}

// Check nutrient levels from recent analyses
function checkNutrientLevels() {
  const { fields } = useFieldsStore.getState();
  const { analyses } = useAnalysisStore.getState();
  const { addNotification, notifications } = useNotificationStore.getState();

  fields.forEach((field) => {
    const fieldAnalyses = analyses
      .filter((a: AnalysisResult) => a.fieldId === field.id)
      .sort((a: AnalysisResult, b: AnalysisResult) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    if (fieldAnalyses.length > 0) {
      const latestAnalysis = fieldAnalyses[0];
      const { nitrogen, phosphorus, potassium, primaryDeficiency } = latestAnalysis.nutrient;

      // Critical nutrient deficiency (below 30%)
      if (nitrogen < 30 || phosphorus < 30 || potassium < 30) {
        const deficientNutrient = nitrogen < 30 ? 'Nitrogen' : phosphorus < 30 ? 'Phosphorus' : 'Potassium';
        const level = nitrogen < 30 ? nitrogen : phosphorus < 30 ? phosphorus : potassium;

        const recentNutrientNotif = notifications.find(
          n => n.fieldId === field.id &&
          n.type === 'nutrient' &&
          n.title.includes(deficientNutrient) &&
          new Date(n.timestamp).getTime() > Date.now() - 72 * 60 * 60 * 1000 // 3 days
        );

        if (!recentNutrientNotif) {
          addNotification({
            type: 'nutrient',
            title: `⚠️ Critical ${deficientNutrient} Deficiency: ${field.name}`,
            message: `${deficientNutrient} level at ${level}%. Apply fertilizer immediately to prevent yield loss.`,
            priority: 'high',
            fieldId: field.id,
            actionUrl: `/fields/${field.id}`,
          });
        }
      }
      // Moderate deficiency (30-50%)
      else if (nitrogen < 50 || phosphorus < 50 || potassium < 50) {
        const deficientNutrient = nitrogen < 50 ? 'Nitrogen' : phosphorus < 50 ? 'Phosphorus' : 'Potassium';

        const recentNutrientNotif = notifications.find(
          n => n.fieldId === field.id &&
          n.type === 'nutrient' &&
          n.title.includes('Low') &&
          new Date(n.timestamp).getTime() > Date.now() - 96 * 60 * 60 * 1000 // 4 days
        );

        if (!recentNutrientNotif) {
          addNotification({
            type: 'nutrient',
            title: `📊 Low ${deficientNutrient}: ${field.name}`,
            message: `${deficientNutrient} levels are below optimal. Consider fertilizer application soon.`,
            priority: 'medium',
            fieldId: field.id,
            actionUrl: `/fields/${field.id}`,
          });
        }
      }

      // Water stress alert
      const { soilMoisture, status } = latestAnalysis.water;
      if (soilMoisture < 30) {
        const recentWaterNotif = notifications.find(
          n => n.fieldId === field.id &&
          n.type === 'irrigation' &&
          n.title.includes('Water Stress') &&
          new Date(n.timestamp).getTime() > Date.now() - 24 * 60 * 60 * 1000
        );

        if (!recentWaterNotif) {
          addNotification({
            type: 'irrigation',
            title: `💧 Water Stress Detected: ${field.name}`,
            message: `Soil moisture at ${soilMoisture}%. Irrigation recommended within 24 hours.`,
            priority: 'high',
            fieldId: field.id,
            actionUrl: `/fields/${field.id}`,
          });
        }
      }
    }
  });
}
