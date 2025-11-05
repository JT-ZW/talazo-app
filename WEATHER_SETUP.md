# Talazo Agritech - Weather Integration Setup

## ✅ What We Just Implemented

### New Files Created:
1. **`.env.local`** - Environment variables (API keys, feature flags)
2. **`src/lib/config.ts`** - Centralized configuration with feature flags
3. **`src/lib/weatherService.ts`** - Real weather API integration
4. **`.env.local.example`** - Template for environment setup

### Modified Files:
1. **`src/components/Navbar.tsx`** - Now displays real weather data
2. **`src/lib/notificationTriggers.ts`** - Uses real weather alerts

---

## 🔧 Setup Instructions

### Step 1: Add Your API Key

1. Open `.env.local` file in your project root
2. Replace `your_api_key_here` with your actual OpenWeatherMap API key:
   ```env
   NEXT_PUBLIC_OPENWEATHER_API_KEY=abc123def456ghi789  # Your actual key
   ```

### Step 2: Restart Dev Server

```bash
# Stop the current dev server (Ctrl+C)
npm run dev
```

### Step 3: Verify It's Working

1. Open http://localhost:3000
2. Look at the top-right corner (weather widget)
3. You should see:
   - Real temperature for Harare, Zimbabwe
   - Current weather condition
   - Weather icon matching conditions

---

## 🎯 Features Now Available

### Real Weather Data:
- ✅ Current temperature and conditions
- ✅ 7-day forecast
- ✅ Humidity, wind speed, pressure
- ✅ Weather icons from OpenWeatherMap

### Smart Weather Alerts:
The system now automatically checks for:
- 🌧️ Heavy rain warnings (>70% precipitation)
- 🌡️ High temperature alerts (>35°C)
- ☀️ Drought warnings (humidity <30%)
- ❄️ Frost warnings (temp <5°C)
- 💨 High wind alerts (>40 km/h)

Alerts appear in the notification bell (top right).

---

## 🔄 Feature Flags

You can toggle between real and demo data:

```env
# Use real weather data
NEXT_PUBLIC_USE_REAL_WEATHER=true

# Or use demo mode (for presentations without internet)
NEXT_PUBLIC_USE_REAL_WEATHER=false
NEXT_PUBLIC_DEMO_MODE=true
```

---

## 🐛 Troubleshooting

### Weather shows "Loading..." forever:
- Check your API key is correct in `.env.local`
- Verify you restarted the dev server
- Check browser console for errors (F12)

### Weather shows "DEMO" badge:
- Your API key might be invalid
- Set `NEXT_PUBLIC_USE_REAL_WEATHER=true` in `.env.local`
- Wait a few minutes after creating the API key (activation time)

### API Rate Limits:
- Free tier: 60 calls/minute, 1,000,000 calls/month
- More than enough for development and small-scale production

---

## 📊 What's Next

After confirming weather works, we can:
1. ✅ Add weather forecast display on Dashboard
2. ✅ Create weather-based crop recommendations
3. ✅ Move to Phase 2: Supabase backend setup

---

## 💡 Quick Test

Run this in browser console (F12) to test:

\`\`\`javascript
fetch('https://api.openweathermap.org/data/2.5/weather?lat=-17.8252&lon=31.0335&appid=YOUR_API_KEY&units=metric')
  .then(r => r.json())
  .then(d => console.log(d))
\`\`\`

Replace `YOUR_API_KEY` with your actual key. You should see weather data for Harare.
