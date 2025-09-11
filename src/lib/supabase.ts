import { projectId, publicAnonKey } from '../utils/supabase/info';

// Create a mock supabase client for demo mode
const createMockSupabase = () => ({
  auth: {
    getSession: () => Promise.resolve({ data: { session: null }, error: null }),
    onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
    signInWithPassword: () => Promise.resolve({ error: { message: 'Demo mode - please complete Supabase database setup' } }),
    signUp: () => Promise.resolve({ error: { message: 'Demo mode - please complete Supabase database setup' } }),
    signOut: () => Promise.resolve({ error: null })
  },
  from: () => ({
    select: () => Promise.resolve({ data: [], error: { message: 'Demo mode - please complete Supabase database setup' } }),
    insert: () => Promise.resolve({ data: null, error: { message: 'Demo mode - please complete Supabase database setup' } }),
    update: () => Promise.resolve({ data: null, error: { message: 'Demo mode - please complete Supabase database setup' } }),
    delete: () => Promise.resolve({ data: null, error: { message: 'Demo mode - please complete Supabase database setup' } })
  })
});

// Try to create real Supabase client using provided credentials, fall back to mock
let supabase: any;

try {
  // Use the credentials from info.tsx
  const supabaseUrl = `https://${projectId}.supabase.co`;
  const supabaseAnonKey = publicAnonKey;
  
  if (projectId && publicAnonKey) {
    const { createClient } = require('@supabase/supabase-js');
    supabase = createClient(supabaseUrl, supabaseAnonKey);
    
    // Test the connection by trying to get the current session
    // This will help us know if the database is properly set up
    supabase.auth.getSession().catch(() => {
      // If it fails, it might be that the database isn't set up yet
      console.log('Supabase credentials loaded, but database might need setup');
    });
  } else {
    // Credentials not available, use mock
    supabase = createMockSupabase();
  }
} catch (error) {
  // Package not available or other error, use mock
  console.log('Supabase package not available, using demo mode');
  supabase = createMockSupabase();
}

export { supabase };

// Database schema for reference:
/*
-- Homes table
CREATE TABLE homes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  address TEXT NOT NULL,
  purchase_date TIMESTAMP WITH TIME ZONE,
  purchase_price INTEGER,
  current_value INTEGER,
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  bedrooms INTEGER,
  bathrooms INTEGER,
  square_footage INTEGER,
  year_built INTEGER,
  property_type TEXT,
  photos TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Projects table
CREATE TABLE projects (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  home_id UUID REFERENCES homes(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'planning',
  target_start_date TIMESTAMP WITH TIME ZONE,
  estimated_completion_date TIMESTAMP WITH TIME ZONE,
  actual_completion_date TIMESTAMP WITH TIME ZONE,
  budget INTEGER,
  projected_value INTEGER,
  created_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_date TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tasks table
CREATE TABLE tasks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'pending',
  assigned_to TEXT,
  due_date TIMESTAMP WITH TIME ZONE,
  completed_date TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Photos table
CREATE TABLE photos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  type TEXT NOT NULL, -- 'before', 'after', 'inspirational', 'documentary'
  caption TEXT,
  uploaded_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Project notes table
CREATE TABLE project_notes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  note TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Estimates table
CREATE TABLE estimates (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  contractor TEXT NOT NULL,
  amount INTEGER NOT NULL,
  description TEXT,
  date TIMESTAMP WITH TIME ZONE,
  selected BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Receipts table
CREATE TABLE receipts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  vendor TEXT NOT NULL,
  amount INTEGER NOT NULL,
  category TEXT,
  date TIMESTAMP WITH TIME ZONE,
  receipt_image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Contractors table
CREATE TABLE contractors (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  company TEXT,
  phone TEXT,
  email TEXT,
  specialty TEXT,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Home history table
CREATE TABLE home_history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  home_id UUID REFERENCES homes(id) ON DELETE CASCADE,
  project_name TEXT NOT NULL,
  completion_date DATE,
  description TEXT,
  before_photo TEXT,
  after_photo TEXT,
  projected_value INTEGER,
  actual_value INTEGER,
  was_tracked_project BOOLEAN DEFAULT FALSE,
  original_project_id UUID REFERENCES projects(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE homes ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE estimates ENABLE ROW LEVEL SECURITY;
ALTER TABLE receipts ENABLE ROW LEVEL SECURITY;
ALTER TABLE contractors ENABLE ROW LEVEL SECURITY;
ALTER TABLE home_history ENABLE ROW LEVEL SECURITY;

-- Create policies for authenticated users
CREATE POLICY "Users can view their own homes" ON homes FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own homes" ON homes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own homes" ON homes FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own homes" ON homes FOR DELETE USING (auth.uid() = user_id);

-- Projects policies (through home ownership)
CREATE POLICY "Users can view projects of their homes" ON projects FOR SELECT USING (
  EXISTS (SELECT 1 FROM homes WHERE homes.id = projects.home_id AND homes.user_id = auth.uid())
);
CREATE POLICY "Users can insert projects for their homes" ON projects FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM homes WHERE homes.id = projects.home_id AND homes.user_id = auth.uid())
);
CREATE POLICY "Users can update projects of their homes" ON projects FOR UPDATE USING (
  EXISTS (SELECT 1 FROM homes WHERE homes.id = projects.home_id AND homes.user_id = auth.uid())
);
CREATE POLICY "Users can delete projects of their homes" ON projects FOR DELETE USING (
  EXISTS (SELECT 1 FROM homes WHERE homes.id = projects.home_id AND homes.user_id = auth.uid())
);

-- Similar policies for other tables (tasks, photos, etc.)
CREATE POLICY "Users can view tasks of their projects" ON tasks FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM projects 
    JOIN homes ON homes.id = projects.home_id 
    WHERE projects.id = tasks.project_id AND homes.user_id = auth.uid()
  )
);

-- Add similar policies for all other tables...
*/