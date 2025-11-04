// Mock data for Zimbabwean agricultural context

export const zimbabweanCrops = [
  { id: 'maize', name: 'Maize', season: 'Summer', averageYield: '5-7 tons/ha' },
  { id: 'tobacco', name: 'Tobacco', season: 'Summer', averageYield: '2.5-3.5 tons/ha' },
  { id: 'wheat', name: 'Wheat', season: 'Winter', averageYield: '6-8 tons/ha' },
  { id: 'cotton', name: 'Cotton', season: 'Summer', averageYield: '2-3 tons/ha' },
  { id: 'soya', name: 'Soya Bean', season: 'Summer', averageYield: '2-3 tons/ha' },
  { id: 'sunflower', name: 'Sunflower', season: 'Summer', averageYield: '1.5-2 tons/ha' },
  { id: 'groundnuts', name: 'Groundnuts', season: 'Summer', averageYield: '1-1.5 tons/ha' },
];

export const commonDiseases = [
  {
    id: 'maize-streak',
    name: 'Maize Streak Virus',
    crops: ['maize'],
    symptoms: 'Yellow streaks on leaves',
    severity: 'high',
    treatment: 'Plant resistant varieties, control leafhopper vectors',
  },
  {
    id: 'fall-armyworm',
    name: 'Fall Armyworm',
    crops: ['maize', 'soya', 'wheat'],
    symptoms: 'Leaf damage, holes in leaves',
    severity: 'high',
    treatment: 'Use approved pesticides, early detection crucial',
  },
  {
    id: 'tobacco-mosaic',
    name: 'Tobacco Mosaic Virus',
    crops: ['tobacco'],
    symptoms: 'Mottled leaves, stunted growth',
    severity: 'medium',
    treatment: 'Remove infected plants, sanitize equipment',
  },
  {
    id: 'cotton-bollworm',
    name: 'Cotton Bollworm',
    crops: ['cotton'],
    symptoms: 'Damaged bolls, holes in fruit',
    severity: 'high',
    treatment: 'Monitor regularly, use IPM strategies',
  },
];

export const nutrientDeficiencies = [
  {
    id: 'nitrogen',
    name: 'Nitrogen Deficiency',
    symptoms: 'Yellowing of older leaves, stunted growth',
    recommendation: 'Apply Ammonium Nitrate (34.5% N) at 200-300 kg/ha',
    suppliers: ['ZFC', 'Windmill', 'Omnia'],
  },
  {
    id: 'phosphorus',
    name: 'Phosphorus Deficiency',
    symptoms: 'Purple discoloration, poor root development',
    recommendation: 'Apply Compound D (8-14-7) at 250-400 kg/ha',
    suppliers: ['ZFC', 'Omnia'],
  },
  {
    id: 'potassium',
    name: 'Potassium Deficiency',
    symptoms: 'Leaf edge browning, weak stalks',
    recommendation: 'Apply Potassium Chloride at 100-150 kg/ha',
    suppliers: ['ZFC', 'Windmill'],
  },
];

export const mockWeatherData = {
  current: {
    temp: 28,
    humidity: 65,
    rainfall: 15,
    condition: 'Partly Cloudy',
    windSpeed: 12,
  },
  forecast: [
    { day: 'Mon', temp: 29, condition: 'Sunny', rainfall: 0 },
    { day: 'Tue', temp: 27, condition: 'Cloudy', rainfall: 5 },
    { day: 'Wed', temp: 26, condition: 'Rainy', rainfall: 25 },
    { day: 'Thu', temp: 28, condition: 'Partly Cloudy', rainfall: 10 },
    { day: 'Fri', temp: 30, condition: 'Sunny', rainfall: 0 },
  ],
};

export const mockAnalysisResults = {
  disease: {
    detected: true,
    type: 'Fall Armyworm Infestation',
    confidence: 87,
    affectedArea: 15, // percentage
    severity: 'medium',
    recommendations: [
      'Apply approved pesticides (e.g., Cypermethrin)',
      'Monitor daily for spread',
      'Consider biological control agents',
      'Ensure proper spacing for better air circulation',
    ],
  },
  nutrient: {
    nitrogen: 62, // percentage of optimal
    phosphorus: 78,
    potassium: 55,
    primaryDeficiency: 'Potassium',
    confidence: 82,
    recommendations: [
      'Apply Potassium Chloride at 120 kg/ha',
      'Consider split application for better uptake',
      'Soil test recommended for precise dosage',
    ],
  },
  water: {
    status: 'moderate-stress',
    soilMoisture: 45, // percentage
    confidence: 79,
    recommendations: [
      'Irrigate within next 48 hours',
      'Apply 25-30mm of water',
      'Consider mulching to retain moisture',
      'Check irrigation system for blockages',
    ],
  },
  ndvi: {
    average: 0.65,
    healthy: 0.75,
    stressed: 0.55,
    trend: 'declining',
    historicalData: [
      { date: '2025-10-01', value: 0.72 },
      { date: '2025-10-08', value: 0.70 },
      { date: '2025-10-15', value: 0.68 },
      { date: '2025-10-22', value: 0.66 },
      { date: '2025-11-01', value: 0.65 },
    ],
  },
};

export const mockAgroSuppliers = [
  {
    id: 'zfc',
    name: 'Zimbabwe Fertilizer Company (ZFC)',
    products: ['Compound D', 'Ammonium Nitrate', 'Urea'],
    contact: '+263 242 XXX XXX',
    location: 'Harare',
  },
  {
    id: 'omnia',
    name: 'Omnia Zimbabwe',
    products: ['NPK Blends', 'Specialty Fertilizers'],
    contact: '+263 242 XXX XXX',
    location: 'Harare, Bulawayo',
  },
  {
    id: 'windmill',
    name: 'Windmill',
    products: ['Seeds', 'Fertilizers', 'Agrochemicals'],
    contact: '+263 242 XXX XXX',
    location: 'Nationwide',
  },
  {
    id: 'seed-co',
    name: 'Seed Co',
    products: ['Hybrid Seeds', 'Maize', 'Wheat'],
    contact: '+263 242 XXX XXX',
    location: 'Harare',
  },
];

// Generate mock field data
export const generateMockField = (id: number) => ({
  id: `field-${id}`,
  name: `Field ${id}`,
  cropType: zimbabweanCrops[Math.floor(Math.random() * zimbabweanCrops.length)].id,
  area: Math.floor(Math.random() * 50) + 10, // 10-60 hectares
  plantingDate: new Date(2025, 9, Math.floor(Math.random() * 20) + 1).toISOString(),
  coordinates: [
    [-17.8216 + (Math.random() * 0.1), 31.0492 + (Math.random() * 0.1)],
    [-17.8216 + (Math.random() * 0.1), 31.0592 + (Math.random() * 0.1)],
    [-17.8316 + (Math.random() * 0.1), 31.0592 + (Math.random() * 0.1)],
    [-17.8316 + (Math.random() * 0.1), 31.0492 + (Math.random() * 0.1)],
  ],
  lastScan: new Date(2025, 10, Math.floor(Math.random() * 4) + 1).toISOString(),
  healthStatus: ['healthy', 'warning', 'critical'][Math.floor(Math.random() * 3)],
  notes: 'Sample field for demonstration',
});

// Simulate API delay
export const simulateApiDelay = (ms: number = 1500) => 
  new Promise(resolve => setTimeout(resolve, ms));

// Generate random analysis based on uploaded image characteristics
export const generateAnalysisFromImage = (imageFile: File) => {
  // In a real app, this would analyze the image
  // For now, we'll return randomized but consistent results
  const seed = imageFile.size % 100;
  
  return {
    ...mockAnalysisResults,
    disease: {
      ...mockAnalysisResults.disease,
      confidence: 75 + (seed % 20),
      affectedArea: 10 + (seed % 30),
    },
    nutrient: {
      ...mockAnalysisResults.nutrient,
      confidence: 70 + (seed % 25),
      nitrogen: 50 + (seed % 40),
      phosphorus: 60 + (seed % 35),
      potassium: 45 + (seed % 50),
    },
  };
};
