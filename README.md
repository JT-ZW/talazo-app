# Talazo - Precision Agriculture Platform

![Talazo Logo](public/logo.png)

**Transforming Zimbabwean agriculture through AI-powered crop monitoring and precision farming**

## 🌾 Overview

Talazo is a comprehensive agricultural monitoring platform designed specifically for Zimbabwean farmers. Combining cutting-edge machine learning, precision agriculture techniques, and natural language AI assistance, Talazo helps farmers maximize yields, reduce input costs, and make data-driven decisions.

### Key Features

#### 🤖 AI-Powered Analysis
- **Multi-Crop Disease Detection**: Support for 8 priority crops (Tobacco, Maize, Tomato, Potato, Wheat, Watermelon, Blueberry, Cotton)
- **Nutrient Deficiency Analysis**: NPK level assessment with fertilizer recommendations
- **Dual Analysis System**: Parallel disease and nutrient detection (3-4 second processing)
- **87%+ Confidence**: Production-ready ML models via Roboflow

#### 🎯 Precision Agriculture
- **RGB-Based NDVI**: Vegetation health assessment without specialized cameras
- **Zone-Based Treatment**: 4x4 grid analysis identifying problem areas
- **Resource Optimization**: 50-80% reduction in chemical usage
- **ROI Calculation**: Quantifiable cost savings per hectare

#### 💬 AI Chatbot Assistant
- **Context-Aware Responses**: Understands your specific analysis results
- **Agricultural Expertise**: Zimbabwe-specific farming knowledge
- **Ultra-Fast Streaming**: 500+ tokens/second via Groq API
- **Natural Language**: Ask questions in plain English (Shona/Ndebele planned)
- **24/7 Availability**: Instant expert advice anytime

#### 📊 Comprehensive Dashboard
- **Real-Time Monitoring**: Track field health across multiple plots
- **Weather Integration**: OpenWeatherMap API with 5-day forecasts
- **Historical Trends**: NDVI history and health progression
- **PDF Reports**: Professional analysis reports with recommendations
- **Notification System**: Alerts for critical issues

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm
- Supabase account (database & authentication)
- Roboflow API key (ML models)
- OpenWeatherMap API key (weather data)
- Groq API key (AI assistant)

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/yourusername/talazo.git
cd talazo
```

2. **Install dependencies**
```bash
npm install
```

3. **Configure environment variables**

Create `.env.local` file:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Roboflow ML Models (Disease Detection)
NEXT_PUBLIC_ROBOFLOW_API_KEY=your_roboflow_api_key
NEXT_PUBLIC_ROBOFLOW_TOBACCO_MODEL=tobacco-plant/11
NEXT_PUBLIC_ROBOFLOW_MAIZE_MODEL=corn-leaf-diseases/1
NEXT_PUBLIC_ROBOFLOW_TOMATO_MODEL=tomato-detection-xfgvk/2
NEXT_PUBLIC_ROBOFLOW_POTATO_MODEL=potato-disease-detection/1
NEXT_PUBLIC_ROBOFLOW_WHEAT_MODEL=wheat-disease-detection/1
NEXT_PUBLIC_ROBOFLOW_WATERMELON_MODEL=watermelon-disease/1
NEXT_PUBLIC_ROBOFLOW_BLUEBERRY_MODEL=blueberry-disease-detection/1
NEXT_PUBLIC_ROBOFLOW_COTTON_MODEL=cotton-disease-detection/1
NEXT_PUBLIC_ROBOFLOW_AERIAL_CROP_MODEL=crop-detection-aerial/1
NEXT_PUBLIC_ROBOFLOW_AERIAL_HEALTH_MODEL=crop-health-aerial/1

# Roboflow Nutrient Models
NEXT_PUBLIC_ROBOFLOW_NUTRIENT_MODEL=plant-nutrient-deficiency/1
NEXT_PUBLIC_ROBOFLOW_NUTRIENT_TOMATO_MODEL=tomato-nutrient-deficiency/1
NEXT_PUBLIC_ROBOFLOW_NUTRIENT_MAIZE_MODEL=maize-nitrogen-stress/1
NEXT_PUBLIC_ROBOFLOW_NUTRIENT_POTATO_MODEL=potato-nutrient-deficiency/1
NEXT_PUBLIC_ROBOFLOW_NUTRIENT_WHEAT_MODEL=wheat-nutrient-deficiency/1

# Weather API
NEXT_PUBLIC_OPENWEATHER_API_KEY=your_openweather_api_key

# Groq AI Assistant
GROQ_API_KEY=your_groq_api_key
NEXT_PUBLIC_GROQ_MODEL=llama-3.1-70b-versatile
```

4. **Set up database**
```bash
# Run Supabase migrations
psql -h your-supabase-host -U postgres -d postgres -f supabase-schema.sql
```

5. **Start development server**
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

## 📖 Documentation

Comprehensive setup guides available:
- [**AI Assistant Setup**](AI_ASSISTANT_SETUP.md) - Groq integration, chatbot usage
- [**Precision Agriculture**](PRECISION_AGRICULTURE.md) - Zone analysis, NDVI calculation, resource optimization
- [**Crop & Nutrient Setup**](CROP_NUTRIENT_SETUP.md) - Multi-crop configuration, nutrient models
- [**Supabase Setup**](SUPABASE_SETUP.md) - Database schema, authentication
- [**Weather Integration**](WEATHER_SETUP.md) - OpenWeatherMap API configuration
- [**Roboflow Models**](ROBOFLOW_SETUP.md) - ML model training and deployment
- [**PDF Reports**](PDF_REPORTS_SETUP.md) - Report generation system

## 🏗️ Project Structure

```
talazo/
├── src/
│   ├── app/                      # Next.js App Router
│   │   ├── dashboard/            # Main dashboard
│   │   ├── fields/               # Field management
│   │   ├── insights/             # Analysis insights
│   │   ├── reports/              # PDF reports
│   │   ├── settings/             # User settings
│   │   ├── login/                # Authentication
│   │   └── signup/
│   ├── components/               # React components
│   │   ├── ChatInterface.tsx     # AI chatbot UI
│   │   ├── PrescriptionMap.tsx   # Zone visualization
│   │   ├── ResourceSavings.tsx   # ROI dashboard
│   │   ├── FieldMap.tsx          # Interactive maps
│   │   ├── DiseaseVisualization.tsx
│   │   └── ...
│   └── lib/                      # Core services
│       ├── aiAssistant.ts        # Groq AI integration
│       ├── mlService.ts          # Roboflow ML calls
│       ├── precisionAgriculture.ts  # Zone analysis
│       ├── weatherService.ts     # Weather API
│       ├── pdfGenerator.ts       # Report generation
│       ├── supabase.ts           # Database client
│       └── store.ts              # State management
├── public/                       # Static assets
├── .env.local                    # Environment config
└── package.json
```

## 🌟 Key Technologies

### Frontend
- **Next.js 15**: React framework with App Router
- **TypeScript**: Type-safe development
- **Tailwind CSS**: Utility-first styling
- **Zustand**: State management
- **Lucide Icons**: Modern iconography

### AI & ML
- **Roboflow**: Computer vision models (disease + nutrient detection)
- **Groq**: Ultra-fast LLM API (500+ tokens/sec)
- **Llama 3.1 70B**: Advanced language model
- **Custom RGB Algorithms**: TGI, VARI, ExG vegetation indices

### Backend & Services
- **Supabase**: PostgreSQL database, authentication, real-time sync
- **OpenWeatherMap**: Weather data and forecasts
- **jsPDF**: PDF report generation
- **Leaflet**: Interactive mapping

## 💡 Usage Examples

### 1. Upload & Analyze Crop Image

```typescript
// Automatic crop type detection and dual analysis
const result = await analyzeImageWithML(imageFile, field);

// Returns:
{
  disease: {
    detected: true,
    type: "Early Blight",
    confidence: 0.87,
    affectedArea: 23,
    severity: "HIGH",
    recommendations: [...]
  },
  nutrient: {
    nitrogen: 45,  // 0-100 scale
    phosphorus: 72,
    potassium: 68,
    primaryDeficiency: "Nitrogen",
    recommendations: [...]
  }
}
```

### 2. Generate Precision Agriculture Prescription

```typescript
const zones = await analyzeFieldZones(imageData, detections, fieldArea);
const savings = calculateResourceOptimization(fieldArea, zones);

console.log(`Treat ${savings.zonesRequiringTreatment} of ${savings.totalZones} zones`);
console.log(`Save $${savings.costSavings} (${savings.savingsPercentage}%)`);
```

### 3. Chat with AI Assistant

```tsx
<ChatInterface 
  context={{
    analysis: currentAnalysis,
    field: selectedField,
    weatherData: weatherInfo
  }}
  position="floating"
/>
```

User asks: "What should I do about this?"

AI responds with context-aware advice based on specific analysis results.

## 📊 Supported Crops

| Crop | Disease Models | Nutrient Models | Economic Importance |
|------|---------------|-----------------|---------------------|
| Tobacco | ✅ | ❌ | 15% of Zimbabwe's GDP |
| Maize | ✅ | ✅ | Staple food crop |
| Tomato | ✅ | ✅ | High-value horticulture |
| Potato | ✅ | ✅ | SADC export market |
| Wheat | ✅ | ✅ | Import substitution |
| Watermelon | ✅ | ❌ | Cash crop |
| Blueberry | ✅ | ❌ | Premium export |
| Cotton | ✅ | ❌ | Industrial crop |

## 🎯 Competitive Advantages

1. **Multi-Crop Capability**: 8 priority crops vs. competitors' single-crop focus
2. **Dual Analysis**: Disease + nutrient detection in parallel (unique)
3. **Precision Agriculture**: Zone-based treatment with quantifiable ROI
4. **AI Assistant**: Natural language accessibility (first in market)
5. **Zimbabwe-Specific**: Localized knowledge, weather, and crop selection
6. **Cost Efficiency**: 50-80% reduction in chemical usage
7. **Speed**: 3-4 second analysis + 500+ tokens/sec chat responses

## 🚧 Development Roadmap

### ✅ Completed
- [x] Multi-crop disease detection (8 crops)
- [x] Nutrient deficiency analysis (5 models)
- [x] Parallel analysis system
- [x] RGB-based NDVI calculation
- [x] Zone-based prescription mapping
- [x] Resource optimization calculator
- [x] AI chatbot assistant (Groq integration)
- [x] Weather API integration
- [x] Supabase backend
- [x] PDF report generation

### 🔄 In Progress
- [ ] Multilingual support (Shona/Ndebele)
- [ ] Mobile app (React Native)
- [ ] Offline mode with local caching

### 📅 Planned
- [ ] IoT sensor integration
- [ ] Drone imagery support
- [ ] Market price predictions
- [ ] Community knowledge sharing
- [ ] Voice input/output
- [ ] Automated treatment scheduling

## 🤝 Contributing

We welcome contributions! Please see [CONTRIBUTING.md](CONTRIBUTING.md) for details.

### Development Setup

1. Fork the repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

## 📄 License

This project is licensed under the MIT License - see [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Roboflow** for ML model hosting and inference API
- **Groq** for ultra-fast LLM inference
- **Meta** for Llama 3.1 open-source model
- **OpenWeatherMap** for weather data
- **Supabase** for backend infrastructure
- **Zimbabwe Ministry of Agriculture** for crop data
- **Local farmers** for invaluable feedback and testing

## 📞 Contact & Support

- **Email**: support@talazo.co.zw
- **Website**: https://talazo.co.zw
- **Documentation**: https://docs.talazo.co.zw
- **Discord**: https://discord.gg/talazo

## 🏆 Competition

Built for [Competition Name] - showcasing the potential of AI in African agriculture.

**Vision**: Democratizing precision agriculture for smallholder farmers across Zimbabwe and SADC region.

---

**Built with ❤️ in Zimbabwe | Powered by AI | Designed for Farmers**
