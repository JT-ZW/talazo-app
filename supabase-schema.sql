-- Talazo Agritech Database Schema
-- Run this SQL in your Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table (extends Supabase auth.users)
CREATE TABLE public.users (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  farm_name TEXT,
  location TEXT,
  subscription_tier TEXT DEFAULT 'free' CHECK (subscription_tier IN ('free', 'basic', 'premium')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Users can only read/update their own data
CREATE POLICY "Users can view own data" ON public.users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own data" ON public.users
  FOR UPDATE USING (auth.uid() = id);

-- Fields table
CREATE TABLE public.fields (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  crop_type TEXT NOT NULL,
  area DECIMAL(10, 2) NOT NULL,
  planting_date DATE NOT NULL,
  coordinates JSONB NOT NULL, -- GeoJSON polygon format
  last_scan TIMESTAMP WITH TIME ZONE,
  health_status TEXT CHECK (health_status IN ('healthy', 'warning', 'critical')),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.fields ENABLE ROW LEVEL SECURITY;

-- Users can manage their own fields
CREATE POLICY "Users can view own fields" ON public.fields
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own fields" ON public.fields
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own fields" ON public.fields
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own fields" ON public.fields
  FOR DELETE USING (auth.uid() = user_id);

-- Analyses table
CREATE TABLE public.analyses (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  field_id UUID REFERENCES public.fields(id) ON DELETE CASCADE NOT NULL,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  image_url TEXT,
  
  -- Disease detection
  disease_detected BOOLEAN DEFAULT FALSE,
  disease_type TEXT,
  disease_confidence DECIMAL(5, 2),
  disease_affected_area DECIMAL(5, 2),
  disease_severity TEXT,
  disease_recommendations JSONB,
  
  -- Nutrient analysis
  nutrient_nitrogen DECIMAL(5, 2),
  nutrient_phosphorus DECIMAL(5, 2),
  nutrient_potassium DECIMAL(5, 2),
  nutrient_deficiency TEXT,
  nutrient_confidence DECIMAL(5, 2),
  nutrient_recommendations JSONB,
  
  -- Water stress
  water_status TEXT,
  water_soil_moisture DECIMAL(5, 2),
  water_confidence DECIMAL(5, 2),
  water_recommendations JSONB,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.analyses ENABLE ROW LEVEL SECURITY;

-- Users can manage their own analyses
CREATE POLICY "Users can view own analyses" ON public.analyses
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own analyses" ON public.analyses
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own analyses" ON public.analyses
  FOR DELETE USING (auth.uid() = user_id);

-- Indexes for better performance
CREATE INDEX idx_fields_user_id ON public.fields(user_id);
CREATE INDEX idx_fields_health_status ON public.fields(health_status);
CREATE INDEX idx_analyses_user_id ON public.analyses(user_id);
CREATE INDEX idx_analyses_field_id ON public.analyses(field_id);
CREATE INDEX idx_analyses_timestamp ON public.analyses(timestamp DESC);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_fields_updated_at BEFORE UPDATE ON public.fields
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to create user profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, name)
  VALUES (NEW.id, NEW.email, COALESCE(NEW.raw_user_meta_data->>'name', 'New User'));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create user profile automatically
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
