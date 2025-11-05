// Application configuration with feature flags
export const CONFIG = {
  // Feature flags
  USE_REAL_WEATHER: process.env.NEXT_PUBLIC_USE_REAL_WEATHER === 'true',
  USE_REAL_ML: process.env.NEXT_PUBLIC_USE_REAL_ML === 'true',
  DEMO_MODE: process.env.NEXT_PUBLIC_DEMO_MODE === 'true',
  
  // API Keys
  OPENWEATHER_API_KEY: process.env.NEXT_PUBLIC_OPENWEATHER_API_KEY || '',
  ROBOFLOW_API_KEY: process.env.NEXT_PUBLIC_ROBOFLOW_API_KEY || '',
  ROBOFLOW_API_URL: process.env.NEXT_PUBLIC_ROBOFLOW_API_URL || 'https://detect.roboflow.com',
  
  // Crop-specific ML models (8 Priority Crops)
  ROBOFLOW_MODELS: {
    // Disease Detection Models (Ground-level RGB)
    tobacco: process.env.NEXT_PUBLIC_ROBOFLOW_TOBACCO_MODEL || 'tobacco-plant/11',
    maize: process.env.NEXT_PUBLIC_ROBOFLOW_MAIZE_MODEL || 'corn-leaf-diseases/1',
    tomato: process.env.NEXT_PUBLIC_ROBOFLOW_TOMATO_MODEL || 'tomato-detection-xfgvk/2',
    potato: process.env.NEXT_PUBLIC_ROBOFLOW_POTATO_MODEL || 'potato-disease-detection/1',
    wheat: process.env.NEXT_PUBLIC_ROBOFLOW_WHEAT_MODEL || 'wheat-disease-detection/1',
    watermelon: process.env.NEXT_PUBLIC_ROBOFLOW_WATERMELON_MODEL || 'watermelon-disease/1',
    blueberry: process.env.NEXT_PUBLIC_ROBOFLOW_BLUEBERRY_MODEL || 'blueberry-disease-detection/1',
    cotton: process.env.NEXT_PUBLIC_ROBOFLOW_COTTON_MODEL || 'cotton-disease-detection/1',
    
    // Aerial/Drone Models (RGB-based, standard camera compatible)
    aerial_crop: process.env.NEXT_PUBLIC_ROBOFLOW_AERIAL_CROP_MODEL || 'crop-field-aerial/1',
    aerial_health: process.env.NEXT_PUBLIC_ROBOFLOW_AERIAL_HEALTH_MODEL || 'field-health-monitoring/2',
  },
  
  // Nutrient Deficiency Detection Models
  ROBOFLOW_NUTRIENT_MODELS: {
    general: process.env.NEXT_PUBLIC_ROBOFLOW_NUTRIENT_GENERAL_MODEL || 'plant-nutrient-deficiency/1',
    tomato: process.env.NEXT_PUBLIC_ROBOFLOW_NUTRIENT_TOMATO_MODEL || 'tomato-nutrient-deficiency/1',
    maize: process.env.NEXT_PUBLIC_ROBOFLOW_NUTRIENT_MAIZE_MODEL || 'maize-nitrogen-stress/1',
    potato: process.env.NEXT_PUBLIC_ROBOFLOW_NUTRIENT_POTATO_MODEL || 'potato-nutrient-deficiency/1',
  },
  
  // Default location (Harare, Zimbabwe)
  DEFAULT_LOCATION: {
    lat: parseFloat(process.env.NEXT_PUBLIC_DEFAULT_LAT || '-17.8252'),
    lon: parseFloat(process.env.NEXT_PUBLIC_DEFAULT_LON || '31.0335'),
    city: 'Harare',
    country: 'Zimbabwe',
  },
  
  // Weather alert thresholds
  WEATHER_THRESHOLDS: {
    HEAVY_RAIN: 50, // mm in 24h
    HIGH_TEMP: 35, // °C
    LOW_TEMP: 5, // °C
    HIGH_WIND: 40, // km/h
    LOW_HUMIDITY: 30, // %
  },
};
