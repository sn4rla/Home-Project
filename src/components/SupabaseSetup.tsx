import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Alert, AlertDescription } from './ui/alert';
import { CheckCircle, AlertCircle, Copy, ExternalLink } from 'lucide-react';
import { projectId, publicAnonKey } from '../utils/supabase/info';

export function SupabaseSetup() {
  const [copied, setCopied] = useState<string | null>(null);
  
  const supabaseUrl = `https://${projectId}.supabase.co`;
  
  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    setCopied(type);
    setTimeout(() => setCopied(null), 2000);
  };

  const testConnection = async () => {
    try {
      const response = await fetch(`${supabaseUrl}/rest/v1/`, {
        headers: {
          'apikey': publicAnonKey,
          'Authorization': `Bearer ${publicAnonKey}`
        }
      });
      
      if (response.status === 200) {
        alert('✅ Connection successful! Your Supabase is configured correctly.');
      } else {
        alert('❌ Connection failed. Please check your database setup.');
      }
    } catch (error) {
      alert('❌ Connection failed. Please check your internet connection and try again.');
    }
  };

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">Supabase Configuration</h1>
          <p className="text-muted-foreground">Get your home improvement app connected to the cloud</p>
        </div>

        {/* Current Status */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              Your Credentials (Already Configured)
            </CardTitle>
            <CardDescription>
              Your app already has Supabase credentials configured. You just need to set up the database.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="text-sm font-medium">Project URL:</label>
                <div className="flex items-center gap-2 mt-1">
                  <code className="flex-1 text-sm bg-muted p-2 rounded">{supabaseUrl}</code>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => copyToClipboard(supabaseUrl, 'url')}
                  >
                    {copied === 'url' ? <CheckCircle className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
              
              <div>
                <label className="text-sm font-medium">Anon Key:</label>
                <div className="flex items-center gap-2 mt-1">
                  <code className="flex-1 text-sm bg-muted p-2 rounded break-all">{publicAnonKey}</code>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => copyToClipboard(publicAnonKey, 'key')}
                  >
                    {copied === 'key' ? <CheckCircle className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
            </div>

            <Button onClick={testConnection} className="w-full">
              Test Connection
            </Button>
          </CardContent>
        </Card>

        {/* Setup Steps */}
        <Card>
          <CardHeader>
            <CardTitle>Setup Steps</CardTitle>
            <CardDescription>
              Follow these steps to complete your Supabase setup
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-bold">
                  1
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold">Visit Your Supabase Project</h3>
                  <p className="text-sm text-muted-foreground mb-2">
                    Go to your Supabase project dashboard
                  </p>
                  <Button variant="outline" size="sm" asChild>
                    <a href={supabaseUrl} target="_blank" rel="noopener noreferrer">
                      Open Project <ExternalLink className="h-4 w-4 ml-1" />
                    </a>
                  </Button>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-bold">
                  2
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold">Set Up Database</h3>
                  <p className="text-sm text-muted-foreground mb-2">
                    Create your database tables using the SQL Editor
                  </p>
                  <ol className="text-sm text-muted-foreground space-y-1 list-decimal list-inside">
                    <li>Click on "SQL Editor" in the left sidebar</li>
                    <li>Click "New query"</li>
                    <li>Copy the SQL from your SUPABASE_SETUP.md file (lines 25-254)</li>
                    <li>Paste it and click "Run"</li>
                    <li>Verify all tables are created in "Table Editor"</li>
                  </ol>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-bold">
                  3
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold">Enable Authentication</h3>
                  <p className="text-sm text-muted-foreground mb-2">
                    Configure user sign-up and login
                  </p>
                  <ol className="text-sm text-muted-foreground space-y-1 list-decimal list-inside">
                    <li>Go to "Authentication" → "Settings"</li>
                    <li>Ensure "Enable email confirmations" is OFF (for testing)</li>
                    <li>Ensure "Enable sign ups" is ON</li>
                  </ol>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-bold">
                  4
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold">Test the App</h3>
                  <p className="text-sm text-muted-foreground">
                    Come back here and refresh the page. Your app should now be fully functional!
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick SQL Copy */}
        <Card>
          <CardHeader>
            <CardTitle>Quick SQL Setup</CardTitle>
            <CardDescription>
              Copy this SQL and paste it into your Supabase SQL Editor
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Button 
                variant="outline" 
                onClick={() => copyToClipboard(sqlSchema, 'sql')}
                className="w-full"
              >
                {copied === 'sql' ? 'Copied!' : 'Copy SQL Schema'}
              </Button>
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  This will create all tables, security policies, and indexes needed for your app.
                </AlertDescription>
              </Alert>
            </div>
          </CardContent>
        </Card>

        <div className="text-center">
          <Button asChild size="lg">
            <a href="/">Back to App</a>
          </Button>
        </div>
      </div>
    </div>
  );
}

const sqlSchema = `-- Enable UUID extension
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
);`;