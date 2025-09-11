# Supabase Setup Guide for HomeProject Pro

## 1. Create a Supabase Project

1. Go to [supabase.com](https://supabase.com) and create a free account
2. Create a new project
3. Wait for the project to be provisioned

## 2. Get Your Project Credentials

1. Go to Project Settings → API
2. Copy your Project URL and anon/public API key
3. Add these to your environment variables:

```bash
# Add to your .env.local file
REACT_APP_SUPABASE_URL=your_project_url_here
REACT_APP_SUPABASE_ANON_KEY=your_anon_key_here
```

## 3. Set Up Database Schema

Go to the SQL Editor in your Supabase dashboard and run this SQL to create all tables:

```sql
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

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

-- Tasks policies
CREATE POLICY "Users can view tasks of their projects" ON tasks FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM projects 
    JOIN homes ON homes.id = projects.home_id 
    WHERE projects.id = tasks.project_id AND homes.user_id = auth.uid()
  )
);
CREATE POLICY "Users can insert tasks for their projects" ON tasks FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM projects 
    JOIN homes ON homes.id = projects.home_id 
    WHERE projects.id = tasks.project_id AND homes.user_id = auth.uid()
  )
);
CREATE POLICY "Users can update tasks of their projects" ON tasks FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM projects 
    JOIN homes ON homes.id = projects.home_id 
    WHERE projects.id = tasks.project_id AND homes.user_id = auth.uid()
  )
);
CREATE POLICY "Users can delete tasks of their projects" ON tasks FOR DELETE USING (
  EXISTS (
    SELECT 1 FROM projects 
    JOIN homes ON homes.id = projects.home_id 
    WHERE projects.id = tasks.project_id AND homes.user_id = auth.uid()
  )
);

-- Similar policies for other tables
CREATE POLICY "Users can manage photos of their projects" ON photos FOR ALL USING (
  EXISTS (
    SELECT 1 FROM projects 
    JOIN homes ON homes.id = projects.home_id 
    WHERE projects.id = photos.project_id AND homes.user_id = auth.uid()
  )
);

CREATE POLICY "Users can manage notes of their projects" ON project_notes FOR ALL USING (
  EXISTS (
    SELECT 1 FROM projects 
    JOIN homes ON homes.id = projects.home_id 
    WHERE projects.id = project_notes.project_id AND homes.user_id = auth.uid()
  )
);

CREATE POLICY "Users can manage estimates of their projects" ON estimates FOR ALL USING (
  EXISTS (
    SELECT 1 FROM projects 
    JOIN homes ON homes.id = projects.home_id 
    WHERE projects.id = estimates.project_id AND homes.user_id = auth.uid()
  )
);

CREATE POLICY "Users can manage receipts of their projects" ON receipts FOR ALL USING (
  EXISTS (
    SELECT 1 FROM projects 
    JOIN homes ON homes.id = projects.home_id 
    WHERE projects.id = receipts.project_id AND homes.user_id = auth.uid()
  )
);

CREATE POLICY "Users can manage contractors of their projects" ON contractors FOR ALL USING (
  EXISTS (
    SELECT 1 FROM projects 
    JOIN homes ON homes.id = projects.home_id 
    WHERE projects.id = contractors.project_id AND homes.user_id = auth.uid()
  )
);

CREATE POLICY "Users can manage history of their homes" ON home_history FOR ALL USING (
  EXISTS (SELECT 1 FROM homes WHERE homes.id = home_history.home_id AND homes.user_id = auth.uid())
);
```

## 4. Enable Authentication

1. Go to Authentication → Settings
2. Enable email/password authentication
3. Configure any additional auth providers if needed

## 5. Install Dependencies

Make sure your project has the Supabase client installed:

```bash
npm install @supabase/supabase-js
```

## 6. Test the Connection

1. Start your development server
2. Try creating an account or signing in
3. The app will work in demo mode even without Supabase configured

## Features Enabled with Supabase

✅ **User Authentication** - Secure login/signup  
✅ **Data Persistence** - All projects saved to cloud  
✅ **Multi-device Sync** - Access from any device  
✅ **Real-time Updates** - Live collaboration potential  
✅ **Photo Storage** - Store project photos securely  
✅ **Backup & Recovery** - Never lose your data  

## Security Features

- Row Level Security (RLS) ensures users only see their own data
- JWT tokens for secure API access
- Encrypted data transmission
- Automatic backup and recovery

## Support

If you need help setting up Supabase, you can:
- Check the [Supabase Documentation](https://supabase.com/docs)
- Join the [Supabase Discord](https://discord.supabase.com)
- File an issue in this project's repository