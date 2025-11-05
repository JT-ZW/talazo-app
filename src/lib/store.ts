import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { signUpWithSupabase, signInWithSupabase, signOutFromSupabase } from './supabaseAuth';
import {
  fetchFields,
  addFieldToSupabase,
  updateFieldInSupabase,
  deleteFieldFromSupabase,
} from './supabaseFields';
import {
  fetchAnalyses,
  addAnalysisToSupabase,
  deleteAnalysisFromSupabase,
} from './supabaseAnalyses';

// Types
export interface User {
  id: string;
  email: string;
  name: string;
  farmName?: string;
  location?: string;
  subscriptionTier?: 'free' | 'basic' | 'premium';
}

export interface Field {
  id: string;
  name: string;
  cropType: string;
  area: number;
  plantingDate: string;
  coordinates: number[][];
  lastScan?: string;
  healthStatus?: 'healthy' | 'warning' | 'critical';
  notes?: string;
}

export interface AnalysisResult {
  id: string;
  fieldId: string;
  timestamp: string;
  imageUrl?: string;
  disease: {
    detected: boolean;
    type: string;
    confidence: number;
    affectedArea: number;
    severity: string;
    recommendations: string[];
  };
  nutrient: {
    nitrogen: number;
    phosphorus: number;
    potassium: number;
    primaryDeficiency: string;
    confidence: number;
    recommendations: string[];
  };
  water: {
    status: string;
    soilMoisture: number;
    confidence: number;
    recommendations: string[];
  };
  ndvi: {
    average: number;
    healthy: number;
    stressed: number;
    trend: string;
    historicalData: Array<{ date: string; value: number }>;
  };
}

// Auth Store
interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  signup: (email: string, password: string, name: string) => Promise<boolean>;
  logout: () => void;
  updateProfile: (updates: Partial<User>) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      login: async (email: string, password: string) => {
        const result = await signInWithSupabase(email, password);
        
        if (result.success && result.user) {
          const user: User = {
            id: result.user.id,
            email: result.user.email,
            name: result.user.name,
            subscriptionTier: 'free',
          };
          
          set({ user, isAuthenticated: true });
          return true;
        }
        
        console.error('Login failed:', result.error);
        return false;
      },
      signup: async (email: string, password: string, name: string) => {
        const result = await signUpWithSupabase(email, password, name);
        
        if (result.success && result.user) {
          const user: User = {
            id: result.user.id,
            email: result.user.email,
            name: result.user.name,
            subscriptionTier: 'free',
          };
          
          set({ user, isAuthenticated: true });
          return true;
        }
        
        console.error('Signup failed:', result.error);
        return false;
      },
      logout: async () => {
        await signOutFromSupabase();
        set({ user: null, isAuthenticated: false });
      },
      updateProfile: (updates: Partial<User>) => {
        const currentUser = get().user;
        if (currentUser) {
          set({ user: { ...currentUser, ...updates } });
        }
      },
    }),
    {
      name: 'talazo-auth',
    }
  )
);

// Fields Store
interface FieldsState {
  fields: Field[];
  isLoading: boolean;
  syncFields: (userId: string) => Promise<void>;
  addField: (field: Omit<Field, 'id'>, userId: string) => Promise<void>;
  updateField: (id: string, updates: Partial<Field>) => Promise<void>;
  deleteField: (id: string) => Promise<void>;
  getField: (id: string) => Field | undefined;
}

export const useFieldsStore = create<FieldsState>()(
  persist(
    (set, get) => ({
      fields: [],
      isLoading: false,
      syncFields: async (userId: string) => {
        set({ isLoading: true });
        const fields = await fetchFields(userId);
        set({ fields, isLoading: false });
      },
      addField: async (field, userId) => {
        set({ isLoading: true });
        const newField = await addFieldToSupabase(userId, field);
        if (newField) {
          set((state) => ({ 
            fields: [...state.fields, newField],
            isLoading: false 
          }));
        } else {
          set({ isLoading: false });
        }
      },
      updateField: async (id, updates) => {
        set({ isLoading: true });
        const success = await updateFieldInSupabase(id, updates);
        if (success) {
          set((state) => ({
            fields: state.fields.map((field) =>
              field.id === id ? { ...field, ...updates } : field
            ),
            isLoading: false,
          }));
        } else {
          set({ isLoading: false });
        }
      },
      deleteField: async (id) => {
        set({ isLoading: true });
        const success = await deleteFieldFromSupabase(id);
        if (success) {
          set((state) => ({
            fields: state.fields.filter((field) => field.id !== id),
            isLoading: false,
          }));
        } else {
          set({ isLoading: false });
        }
      },
      getField: (id) => {
        return get().fields.find((field) => field.id === id);
      },
    }),
    {
      name: 'talazo-fields',
    }
  )
);

// Analysis Store
interface AnalysisState {
  analyses: AnalysisResult[];
  currentAnalysis: AnalysisResult | null;
  isAnalyzing: boolean;
  syncAnalyses: (userId: string) => Promise<void>;
  addAnalysis: (analysis: Omit<AnalysisResult, 'id' | 'timestamp'>, userId: string) => Promise<void>;
  deleteAnalysis: (id: string) => Promise<void>;
  setCurrentAnalysis: (analysis: AnalysisResult | null) => void;
  setIsAnalyzing: (isAnalyzing: boolean) => void;
  getFieldAnalyses: (fieldId: string) => AnalysisResult[];
}

export const useAnalysisStore = create<AnalysisState>()(
  persist(
    (set, get) => ({
      analyses: [],
      currentAnalysis: null,
      isAnalyzing: false,
      syncAnalyses: async (userId: string) => {
        const analyses = await fetchAnalyses(userId);
        set({ analyses });
      },
      addAnalysis: async (analysis, userId) => {
        set({ isAnalyzing: true });
        const newAnalysis = await addAnalysisToSupabase(userId, analysis);
        if (newAnalysis) {
          set((state) => ({
            analyses: [...state.analyses, newAnalysis],
            currentAnalysis: newAnalysis,
            isAnalyzing: false,
          }));
        } else {
          set({ isAnalyzing: false });
        }
      },
      deleteAnalysis: async (id: string) => {
        const success = await deleteAnalysisFromSupabase(id);
        if (success) {
          set((state) => ({
            analyses: state.analyses.filter((a) => a.id !== id),
          }));
        }
      },
      setCurrentAnalysis: (analysis) => {
        set({ currentAnalysis: analysis });
      },
      setIsAnalyzing: (isAnalyzing) => {
        set({ isAnalyzing });
      },
      getFieldAnalyses: (fieldId) => {
        return get().analyses.filter((analysis) => analysis.fieldId === fieldId);
      },
    }),
    {
      name: 'talazo-analyses',
    }
  )
);

// Notification Types
export interface Notification {
  id: string;
  type: 'disease' | 'weather' | 'irrigation' | 'harvest' | 'nutrient' | 'info';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  priority: 'low' | 'medium' | 'high';
  fieldId?: string;
  actionUrl?: string;
}

interface NotificationState {
  notifications: Notification[];
  unreadCount: number;
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  deleteNotification: (id: string) => void;
  clearAll: () => void;
}

export const useNotificationStore = create<NotificationState>()(
  persist(
    (set) => ({
      notifications: [],
      unreadCount: 0,
      addNotification: (notification) => {
        const newNotification: Notification = {
          ...notification,
          id: `notif-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          timestamp: new Date().toISOString(),
          read: false,
        };
        set((state) => ({
          notifications: [newNotification, ...state.notifications],
          unreadCount: state.unreadCount + 1,
        }));
      },
      markAsRead: (id) => {
        set((state) => ({
          notifications: state.notifications.map((n) =>
            n.id === id ? { ...n, read: true } : n
          ),
          unreadCount: Math.max(0, state.unreadCount - 1),
        }));
      },
      markAllAsRead: () => {
        set((state) => ({
          notifications: state.notifications.map((n) => ({ ...n, read: true })),
          unreadCount: 0,
        }));
      },
      deleteNotification: (id) => {
        set((state) => {
          const notification = state.notifications.find((n) => n.id === id);
          return {
            notifications: state.notifications.filter((n) => n.id !== id),
            unreadCount: notification && !notification.read 
              ? Math.max(0, state.unreadCount - 1) 
              : state.unreadCount,
          };
        });
      },
      clearAll: () => {
        set({ notifications: [], unreadCount: 0 });
      },
    }),
    {
      name: 'talazo-notifications',
    }
  )
);
