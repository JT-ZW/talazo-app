import { CONFIG } from './config';

export interface WeatherData {
  current: {
    temp: number;
    feelsLike: number;
    condition: string;
    description: string;
    humidity: number;
    windSpeed: number;
    pressure: number;
    icon: string;
  };
  forecast: Array<{
    date: string;
    tempMax: number;
    tempMin: number;
    condition: string;
    description: string;
    humidity: number;
    windSpeed: number;
    precipitation: number;
    icon: string;
  }>;
  alerts?: Array<{
    event: string;
    description: string;
    severity: 'minor' | 'moderate' | 'severe' | 'extreme';
    start: number;
    end: number;
  }>;
}

export interface WeatherAlert {
  type: 'heavy_rain' | 'drought' | 'frost' | 'high_temp' | 'high_wind';
  title: string;
  message: string;
  severity: 'low' | 'medium' | 'high';
}

export interface UserLocation {
  lat: number;
  lon: number;
  city?: string;
  country?: string;
}

/**
 * Gets user's current location using browser geolocation API
 * Falls back to default Zimbabwe location if permission denied or unavailable
 */
export async function getUserLocation(): Promise<UserLocation> {
  return new Promise((resolve) => {
    if (!navigator.geolocation) {
      console.log('Geolocation not supported, using default location');
      resolve(CONFIG.DEFAULT_LOCATION);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          lat: position.coords.latitude,
          lon: position.coords.longitude,
        });
      },
      (error) => {
        console.log('Geolocation permission denied or error:', error.message);
        resolve(CONFIG.DEFAULT_LOCATION);
      },
      {
        timeout: 5000,
        maximumAge: 300000, // Cache for 5 minutes
      }
    );
  });
}

/**
 * Fetches current weather data from OpenWeatherMap API
 */
export async function fetchWeatherData(lat?: number, lon?: number): Promise<WeatherData> {
  const latitude = lat || CONFIG.DEFAULT_LOCATION.lat;
  const longitude = lon || CONFIG.DEFAULT_LOCATION.lon;
  const apiKey = CONFIG.OPENWEATHER_API_KEY;

  if (!apiKey) {
    console.warn('OpenWeatherMap API key not configured, using mock data');
    return getMockWeatherData();
  }

  try {
    // Fetch current weather
    const currentResponse = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${apiKey}&units=metric`
    );

    if (!currentResponse.ok) {
      throw new Error(`Weather API error: ${currentResponse.status}`);
    }

    const currentData = await currentResponse.json();

    // Fetch 5-day forecast
    const forecastResponse = await fetch(
      `https://api.openweathermap.org/data/2.5/forecast?lat=${latitude}&lon=${longitude}&appid=${apiKey}&units=metric`
    );

    if (!forecastResponse.ok) {
      throw new Error(`Forecast API error: ${forecastResponse.status}`);
    }

    const forecastData = await forecastResponse.json();

    // Process forecast data - get one forecast per day at noon
    const dailyForecasts = forecastData.list
      .filter((_: unknown, index: number) => index % 8 === 0) // Every 8th item is roughly 24h later
      .slice(0, 7)
      .map((item: {
        dt: number;
        main: { temp_max: number; temp_min: number; humidity: number };
        weather: Array<{ main: string; description: string; icon: string }>;
        wind: { speed: number };
        pop: number;
      }) => ({
        date: new Date(item.dt * 1000).toISOString(),
        tempMax: Math.round(item.main.temp_max),
        tempMin: Math.round(item.main.temp_min),
        condition: item.weather[0].main,
        description: item.weather[0].description,
        humidity: item.main.humidity,
        windSpeed: Math.round(item.wind.speed * 3.6), // Convert m/s to km/h
        precipitation: Math.round(item.pop * 100), // Probability of precipitation
        icon: item.weather[0].icon,
      }));

    return {
      current: {
        temp: Math.round(currentData.main.temp),
        feelsLike: Math.round(currentData.main.feels_like),
        condition: currentData.weather[0].main,
        description: currentData.weather[0].description,
        humidity: currentData.main.humidity,
        windSpeed: Math.round(currentData.wind.speed * 3.6), // Convert m/s to km/h
        pressure: currentData.main.pressure,
        icon: currentData.weather[0].icon,
      },
      forecast: dailyForecasts,
    };
  } catch (error) {
    console.error('Failed to fetch weather data:', error);
    return getMockWeatherData();
  }
}

/**
 * Analyzes weather data and generates alerts for agricultural concerns
 */
export function analyzeWeatherAlerts(weather: WeatherData): WeatherAlert[] {
  const alerts: WeatherAlert[] = [];
  const { current, forecast } = weather;

  // Check for heavy rain in forecast
  const heavyRainDays = forecast.filter(day => day.precipitation > 70);
  if (heavyRainDays.length > 0) {
    alerts.push({
      type: 'heavy_rain',
      title: '🌧️ Heavy Rain Expected',
      message: `Heavy rainfall forecasted for the next ${heavyRainDays.length} day(s). Check drainage systems and protect vulnerable crops.`,
      severity: 'high',
    });
  }

  // Check for high temperatures
  if (current.temp > CONFIG.WEATHER_THRESHOLDS.HIGH_TEMP) {
    alerts.push({
      type: 'high_temp',
      title: '🌡️ High Temperature Alert',
      message: `Current temperature is ${current.temp}°C. Increase irrigation frequency and monitor for heat stress.`,
      severity: 'medium',
    });
  }

  // Check for low humidity (drought conditions)
  if (current.humidity < CONFIG.WEATHER_THRESHOLDS.LOW_HUMIDITY) {
    alerts.push({
      type: 'drought',
      title: '☀️ Low Humidity Warning',
      message: `Humidity at ${current.humidity}%. Extended dry conditions expected. Plan irrigation schedules accordingly.`,
      severity: 'medium',
    });
  }

  // Check for frost risk (low temperatures)
  const frostRiskDays = forecast.filter(day => day.tempMin < CONFIG.WEATHER_THRESHOLDS.LOW_TEMP);
  if (frostRiskDays.length > 0) {
    alerts.push({
      type: 'frost',
      title: '❄️ Frost Warning',
      message: `Low temperatures expected (${frostRiskDays[0].tempMin}°C). Protect sensitive crops from frost damage.`,
      severity: 'high',
    });
  }

  // Check for high winds
  if (current.windSpeed > CONFIG.WEATHER_THRESHOLDS.HIGH_WIND) {
    alerts.push({
      type: 'high_wind',
      title: '💨 High Wind Alert',
      message: `Wind speeds reaching ${current.windSpeed} km/h. Secure equipment and protect tall crops.`,
      severity: 'medium',
    });
  }

  return alerts;
}

/**
 * Fallback mock weather data for demo mode or API failures
 */
function getMockWeatherData(): WeatherData {
  return {
    current: {
      temp: 28,
      feelsLike: 30,
      condition: 'Clear',
      description: 'clear sky',
      humidity: 45,
      windSpeed: 12,
      pressure: 1013,
      icon: '01d',
    },
    forecast: [
      {
        date: new Date(Date.now() + 86400000).toISOString(),
        tempMax: 30,
        tempMin: 18,
        condition: 'Clear',
        description: 'clear sky',
        humidity: 40,
        windSpeed: 10,
        precipitation: 0,
        icon: '01d',
      },
      {
        date: new Date(Date.now() + 172800000).toISOString(),
        tempMax: 29,
        tempMin: 19,
        condition: 'Clouds',
        description: 'few clouds',
        humidity: 50,
        windSpeed: 15,
        precipitation: 10,
        icon: '02d',
      },
      {
        date: new Date(Date.now() + 259200000).toISOString(),
        tempMax: 27,
        tempMin: 17,
        condition: 'Rain',
        description: 'light rain',
        humidity: 70,
        windSpeed: 20,
        precipitation: 60,
        icon: '10d',
      },
    ],
  };
}

/**
 * Gets weather icon URL from OpenWeatherMap
 */
export function getWeatherIconUrl(iconCode: string): string {
  return `https://openweathermap.org/img/wn/${iconCode}@2x.png`;
}
