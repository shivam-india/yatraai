-- ==============================================================================
-- YATRA AI - SUPABASE POSTGRESQL SCHEMA
-- Turn every journey into an experience.
-- ==============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Profiles Table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. User Preferences Table
CREATE TABLE IF NOT EXISTS user_preferences (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  preferred_transport TEXT[] DEFAULT ARRAY['bus', 'train', 'metro', 'walking'],
  interests TEXT[] DEFAULT ARRAY['history', 'food', 'culture'],
  walking_tolerance_mins INT DEFAULT 20,
  budget_level TEXT DEFAULT 'moderate', -- budget, moderate, luxury
  dietary_preferences TEXT[] DEFAULT ARRAY['vegetarian_friendly'],
  avoid_crowds BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Places Master Table
CREATE TABLE IF NOT EXISTS places (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  serpapi_place_id TEXT UNIQUE,
  name TEXT NOT NULL,
  category TEXT NOT NULL, -- 'historical', 'food', 'culture', 'nature', 'market', 'artisan', 'hidden_gem'
  description TEXT,
  address TEXT,
  city TEXT NOT NULL,
  state TEXT,
  latitude DOUBLE PRECISION NOT NULL,
  longitude DOUBLE PRECISION NOT NULL,
  rating DOUBLE PRECISION DEFAULT 4.5,
  reviews_count INT DEFAULT 0,
  price_level INT DEFAULT 1, -- 0 (free) to 4 (expensive)
  typical_visit_mins INT DEFAULT 45,
  opening_hours JSONB,
  photos TEXT[],
  is_verified BOOLEAN DEFAULT TRUE,
  source TEXT DEFAULT 'verified', -- 'verified', 'serpapi', 'community', 'ai_suggested'
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Place Reviews Table
CREATE TABLE IF NOT EXISTS place_reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  place_id UUID REFERENCES places(id) ON DELETE CASCADE,
  author_name TEXT NOT NULL,
  rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
  review_text TEXT,
  visit_date DATE,
  source TEXT DEFAULT 'google',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Local Businesses Table (Artisans, Family eateries, Craftsmen)
CREATE TABLE IF NOT EXISTS local_businesses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  place_id UUID REFERENCES places(id) ON DELETE SET NULL,
  business_name TEXT NOT NULL,
  business_type TEXT NOT NULL, -- 'handicrafts', 'heritage_eatery', 'artisan_workshop', 'organic_market'
  owner_story TEXT,
  specialties TEXT[],
  price_range TEXT,
  contact_phone TEXT,
  contact_website TEXT,
  is_family_owned BOOLEAN DEFAULT TRUE,
  is_verified_local BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Local Experiences Table
CREATE TABLE IF NOT EXISTS local_experiences (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  place_id UUID REFERENCES places(id) ON DELETE CASCADE,
  category TEXT NOT NULL,
  short_summary TEXT NOT NULL,
  duration_mins INT NOT NULL DEFAULT 30,
  cost_estimate INT DEFAULT 0,
  explore_value_score INT DEFAULT 85,
  best_time_to_visit TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Transport Routes Table
CREATE TABLE IF NOT EXISTS transport_routes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  origin_city TEXT NOT NULL,
  destination_city TEXT NOT NULL,
  transport_type TEXT NOT NULL, -- 'bus', 'train', 'metro', 'shuttle'
  operator_name TEXT NOT NULL,
  departure_location TEXT NOT NULL,
  arrival_location TEXT NOT NULL,
  scheduled_departure TIMESTAMPTZ,
  scheduled_arrival TIMESTAMPTZ,
  typical_duration_mins INT NOT NULL,
  base_fare INT NOT NULL,
  route_polyline JSONB, -- GeoJSON or polyline points
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. Transport Updates (Real-time delays, cancellations)
CREATE TABLE IF NOT EXISTS transport_updates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  route_id UUID REFERENCES transport_routes(id) ON DELETE CASCADE,
  delay_minutes INT DEFAULT 0,
  status TEXT DEFAULT 'on_time', -- 'on_time', 'delayed', 'cancelled', 'rescheduled'
  advisory_message TEXT,
  reported_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. Journeys Table
CREATE TABLE IF NOT EXISTS journeys (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  origin_name TEXT NOT NULL,
  destination_name TEXT NOT NULL,
  origin_lat DOUBLE PRECISION NOT NULL,
  origin_lng DOUBLE PRECISION NOT NULL,
  dest_lat DOUBLE PRECISION NOT NULL,
  dest_lng DOUBLE PRECISION NOT NULL,
  total_duration_mins INT NOT NULL,
  total_budget_est INT NOT NULL,
  interests TEXT[],
  transport_mode TEXT DEFAULT 'public_transport',
  status TEXT DEFAULT 'draft', -- 'draft', 'active', 'completed', 'archived'
  ai_summary TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. Journey Stops Table (Timeline Waypoints & Detours)
CREATE TABLE IF NOT EXISTS journey_stops (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  journey_id UUID REFERENCES journeys(id) ON DELETE CASCADE,
  place_id UUID REFERENCES places(id) ON DELETE SET NULL,
  stop_order INT NOT NULL,
  stop_type TEXT NOT NULL, -- 'origin', 'transit_hub', 'smart_detour', 'food_stop', 'destination'
  stop_title TEXT NOT NULL,
  stop_description TEXT,
  arrival_time TIMESTAMPTZ,
  departure_time TIMESTAMPTZ,
  dwell_time_mins INT DEFAULT 0,
  travel_time_from_prev_mins INT DEFAULT 0,
  cost_est INT DEFAULT 0,
  distance_km DOUBLE PRECISION DEFAULT 0.0,
  explore_value INT DEFAULT 80,
  detour_reason TEXT,
  is_completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 11. Saved Places Table
CREATE TABLE IF NOT EXISTS saved_places (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  place_id UUID REFERENCES places(id) ON DELETE CASCADE,
  saved_at TIMESTAMPTZ DEFAULT NOW(),
  notes TEXT,
  UNIQUE(user_id, place_id)
);

-- 12. Saved Journeys Table
CREATE TABLE IF NOT EXISTS saved_journeys (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  journey_id UUID REFERENCES journeys(id) ON DELETE CASCADE,
  saved_at TIMESTAMPTZ DEFAULT NOW(),
  notes TEXT,
  UNIQUE(user_id, journey_id)
);

-- 13. Community Submissions Table
CREATE TABLE IF NOT EXISTS community_submissions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  place_name TEXT NOT NULL,
  category TEXT NOT NULL,
  city TEXT NOT NULL,
  location_coordinates JSONB,
  description TEXT NOT NULL,
  why_special TEXT,
  status TEXT DEFAULT 'pending', -- 'pending', 'approved', 'rejected'
  submitted_at TIMESTAMPTZ DEFAULT NOW(),
  reviewed_at TIMESTAMPTZ
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_places_city ON places(city);
CREATE INDEX IF NOT EXISTS idx_places_category ON places(category);
CREATE INDEX IF NOT EXISTS idx_journey_stops_journey_id ON journey_stops(journey_id);
CREATE INDEX IF NOT EXISTS idx_saved_journeys_user_id ON saved_journeys(user_id);
CREATE INDEX IF NOT EXISTS idx_saved_places_user_id ON saved_places(user_id);

