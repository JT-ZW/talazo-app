import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';
import { getStorage, FirebaseStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Initialize Firebase (only once)
let app: FirebaseApp;
let auth: Auth;
let db: Firestore;
let storage: FirebaseStorage;

if (!getApps().length) {
  app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  db = getFirestore(app);
  storage = getStorage(app);
} else {
  app = getApps()[0];
  auth = getAuth(app);
  db = getFirestore(app);
  storage = getStorage(app);
}

export { app, auth, db, storage };

// Firestore Collection Types
export interface DbUser {
  id: string;
  email: string;
  name: string;
  farmName?: string;
  location?: string;
  subscriptionTier?: 'free' | 'basic' | 'premium';
  createdAt: Date;
  updatedAt: Date;
}

export interface DbField {
  id: string;
  userId: string;
  name: string;
  cropType: string;
  area: number;
  plantingDate: string;
  coordinates: number[][][]; // GeoJSON polygon
  lastScan?: string;
  healthStatus?: 'healthy' | 'warning' | 'critical';
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface DbAnalysis {
  id: string;
  userId: string;
  fieldId: string;
  timestamp: Date;
  imageUrl?: string;
  diseaseDetected: boolean;
  diseaseType: string;
  diseaseConfidence: number;
  diseaseAffectedArea: number;
  diseaseSeverity: string;
  diseaseRecommendations: string[];
  nutrientNitrogen: number;
  nutrientPhosphorus: number;
  nutrientPotassium: number;
  nutrientDeficiency: string;
  nutrientConfidence: number;
  nutrientRecommendations: string[];
  waterStatus: string;
  waterSoilMoisture: number;
  waterConfidence: number;
  waterRecommendations: string[];
  createdAt: Date;
}

// Collection names
export const COLLECTIONS = {
  USERS: 'users',
  FIELDS: 'fields',
  ANALYSES: 'analyses',
} as const;

// Helper to check Firebase connection
export async function checkFirebaseConnection(): Promise<boolean> {
  if (!firebaseConfig.apiKey || !firebaseConfig.projectId) {
    console.warn('Firebase credentials not configured');
    return false;
  }

  try {
    // Simple check - if we can access auth, Firebase is working
    return !!auth;
  } catch (error) {
    console.error('Firebase connection error:', error);
    return false;
  }
}
