# Supabase Configuration and Testing Guide

## Step 1: Create Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Sign up for a free account or log in
3. Click "New Project" 
4. Choose your organization
5. Fill in project details:
   - Name: "HomeProject Pro" (or your preferred name)
   - Database Password: (create a strong password - save this!)
   - Region: Choose closest to your location
6. Click "Create new project"
7. Wait 2-3 minutes for project provisioning

## Step 2: Get Your Credentials

1. In your Supabase dashboard, go to **Settings** → **API**
2. Copy the following values:
   - **Project URL** (looks like: https://xyz123.supabase.co)
   - **anon public key** (long string starting with "eyJ...")

## Step 3: Configure Environment Variables

Create a `.env.local` file in your project root (same level as App.tsx):

```bash
REACT_APP_SUPABASE_URL=your_project_url_here
REACT_APP_SUPABASE_ANON_KEY=your_anon_key_here
```

**Important:** Replace the placeholder values with your actual credentials from Step 2.

Example:
```bash
REACT_APP_SUPABASE_URL=https://abcd1234.supabase.co
REACT_APP_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## Step 4: Set Up Database Schema

1. In your Supabase dashboard, go to **SQL Editor**
2. Click "New query"
3. Copy and paste the entire SQL schema from `SUPABASE_SETUP.md` (lines 25-254)
4. Click "Run" to execute the query
5. You should see success messages for table creation and policy setup

## Step 5: Configure Authentication

1. Go to **Authentication** → **Settings**
2. Under **Auth Providers**, ensure **Email** is enabled
3. Configure settings as needed:
   - **Enable email confirmations** (recommended: OFF for testing, ON for production)
   - **Enable sign ups** (should be ON)

## Step 6: Enable Storage (Optional - for photo uploads)

1. Go to **Storage** 
2. Create a new bucket called `project-photos`
3. Set it to public if you want photos to be publicly accessible
4. Configure policies for authenticated uploads

## Step 7: Test the Integration

### Quick Debug Method

Since the debug component has been removed to prevent module errors, here's how to quickly test your Supabase setup:

1. **Check Environment Variables**: After creating your `.env.local` file, restart your development server and check that the app loads without errors.

2. **Test Authentication**: Try to sign up or sign in. If authentication works, your Supabase URL and API key are correctly configured.

3. **Test Data Operations**: After signing in, try creating a project. If it saves and persists after refresh, your database is working.

4. **Browser Console Debugging**: Open browser developer tools (F12) and look for:
   - Any red error messages related to Supabase
   - Network tab should show successful requests to your Supabase URL
   - Authentication state changes in the console logs

5. **Supabase Dashboard**: Check your Supabase project dashboard:
   - Go to Table Editor to see if data appears
   - Check Authentication → Users to see if accounts are being created
   - Monitor Logs for any errors

## Step 7: Test the Integration

### 7.1 Start Your Development Server

```bash
npm start
```

### 7.2 Test Authentication

1. Open your app (usually http://localhost:3000)
2. You should see the authentication screen
3. Click "Sign Up" and create a test account with:
   - Email: test@example.com
   - Password: testpassword123
4. Check that you get signed in automatically

### 7.3 Test Data Operations

**Test Home Setup:**
1. After signing in, you should see the home dashboard
2. If no home exists, you might see a setup screen
3. Try adding basic home information

**Test Project Creation:**
1. Click the "+" button or "Create Project" 
2. Fill out a test project:
   - Name: "Test Kitchen Remodel"
   - Budget: $5000
   - Description: "Testing the app"
3. Save the project
4. Verify it appears in your project list

**Test Project Details:**
1. Click on your test project
2. Try adding a task
3. Try adding a note
4. Verify data persists when you navigate away and back

### 7.4 Test Data Persistence

1. Sign out of the app
2. Sign back in with the same credentials
3. Verify all your test data is still there

### 7.5 Test Database in Supabase Dashboard

1. Go to **Table Editor** in Supabase
2. Check the following tables have data:
   - `homes` - should have your home info
   - `projects` - should have your test project
   - `tasks` - should have any tasks you created

## Troubleshooting

### Connection Issues

**Error: "Invalid API URL or key"**
- Double-check your `.env.local` file
- Ensure variable names match exactly: `REACT_APP_SUPABASE_URL` and `REACT_APP_SUPABASE_ANON_KEY`
- Restart your development server after adding environment variables

**Error: "supabase is not defined"**
- Run: `npm install @supabase/supabase-js`
- Restart your development server

### Authentication Issues

**Can't sign up:**
- Check Authentication settings in Supabase dashboard
- Ensure "Enable sign ups" is turned ON
- Check for email confirmation settings

**Signed in but no data loading:**
- Check database policies are created correctly
- Look at browser console for errors
- Check Network tab for failed API calls

### Database Issues

**Tables not found:**
- Re-run the SQL schema creation from Step 4
- Check the SQL Editor for any error messages

**Row Level Security errors:**
- Verify all policies were created successfully
- Check that you're signed in when testing

### Environment Variables Not Working

**Variables not being loaded:**
- Ensure file is named exactly `.env.local`
- Ensure variables start with `REACT_APP_`
- Restart development server
- Check that `.env.local` is in project root (same level as package.json)

## Verification Checklist

- [ ] Supabase project created
- [ ] Credentials copied to `.env.local`
- [ ] Database schema created (all tables visible in Table Editor)
- [ ] Authentication enabled
- [ ] Can sign up new account
- [ ] Can sign in with existing account
- [ ] Can create and save projects
- [ ] Data persists across sessions
- [ ] No console errors

## Next Steps

Once everything is working:

1. **Enable email confirmation** in production
2. **Set up proper storage policies** for photo uploads
3. **Configure custom domains** if needed
4. **Set up database backups**
5. **Monitor usage** in Supabase dashboard

## Support

If you encounter issues:

1. Check browser console for errors
2. Check Network tab for failed requests
3. Review Supabase logs in the dashboard
4. Consult [Supabase Documentation](https://supabase.com/docs)
5. Post questions in [Supabase Discord](https://discord.supabase.com)