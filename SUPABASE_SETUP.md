# Supabase Setup Instructions

## Step 1: Create Supabase Project

1. Go to https://supabase.com
2. Click "Start your project"
3. Create a new organization (if you don't have one)
4. Click "New Project" and fill in:
   - **Project Name:** talazo-app
   - **Database Password:** (Create strong password - SAVE THIS!)
   - **Region:** Choose closest to Zimbabwe (South Africa or Europe recommended)
   - **Pricing Plan:** Free tier is perfect for development

5. Wait 2-3 minutes for project to be created

---

## Step 2: Get Your API Keys

1. Once project is created, go to **Project Settings** (gear icon in sidebar)
2. Click on **API** in the left menu
3. Copy these values:
   - **Project URL** (looks like: `https://xxxxx.supabase.co`)
   - **Project API Key (anon, public)** (long string starting with `eyJ...`)

---

## Step 3: Add Keys to Environment

1. Open `.env.local` file in your project
2. Replace these values:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```

---

## Step 4: Create Database Tables

1. In Supabase dashboard, go to **SQL Editor** (in left sidebar)
2. Click "New Query"
3. Copy and paste the **ENTIRE content** from `supabase-schema.sql`
4. Click "Run" or press Ctrl+Enter
5. You should see "Success. No rows returned"

---

## Step 5: Enable Email Authentication

1. Go to **Authentication** → **Providers** in Supabase dashboard
2. Make sure **Email** is enabled (it should be by default)
3. Optional: Configure email templates under **Authentication** → **Email Templates**

---

## Step 6: Verify Setup

1. Go to **Table Editor** in Supabase dashboard
2. You should see these tables:
   - ✅ users
   - ✅ fields
   - ✅ analyses

3. Click on each table to verify structure

---

## Step 7: Test Connection

1. Restart your Next.js dev server:
   ```bash
   # Stop current server (Ctrl+C)
   npm run dev
   ```

2. Open browser console (F12)
3. You should see no Supabase errors
4. Try signing up a new account

---

## 🎯 What You Get

### Cloud Database:
- ✅ PostgreSQL database in the cloud
- ✅ Automatic backups
- ✅ Unlimited devices
- ✅ Real-time sync

### Secure Authentication:
- ✅ Email/password signup
- ✅ JWT tokens
- ✅ Row-level security
- ✅ Password reset emails

### Free Tier Limits:
- 500 MB database
- 2 GB file storage
- 50,000 monthly active users
- Unlimited API requests

**Perfect for MVP and testing!**

---

## 🐛 Troubleshooting

### "Invalid API key" error:
- Double-check you copied the **anon** key (not the service_role key)
- Make sure there are no extra spaces in `.env.local`
- Restart dev server after adding keys

### Tables not showing:
- Make sure SQL script ran successfully (check for errors)
- Refresh the Supabase dashboard
- Check **Database** → **Tables** section

### Can't sign up:
- Check browser console for errors
- Verify email provider is enabled
- Check Supabase logs: **Logs** → **Auth Logs**

---

## Next Steps After Setup

Once everything is working, I'll help you:
1. ✅ Migrate localStorage data to Supabase
2. ✅ Add auth guards to protected pages
3. ✅ Sync fields and analyses to cloud
4. ✅ Add real-time updates

Let me know when you have your Supabase keys ready!
