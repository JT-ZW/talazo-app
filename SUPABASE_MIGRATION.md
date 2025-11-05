# Supabase Migration Guide - Reusing Existing Project

## 🔄 Overview

You're repurposing an existing Supabase project for Talazo. This guide will help you:
1. ✅ Clean up old database tables
2. ✅ Install fresh Talazo schema
3. ✅ Connect your app to existing project
4. ✅ Test everything works

---

## Step 1: Get Your Supabase Credentials

1. Go to https://supabase.com/dashboard
2. Open your existing project
3. Go to **Project Settings** (gear icon) → **API**
4. Copy these two values:
   - **Project URL** (e.g., `https://xxxxx.supabase.co`)
   - **anon public** key (long string starting with `eyJ...`)

5. Update `.env.local` in your project:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```

---

## Step 2: Clean Up Old Database

⚠️ **IMPORTANT**: This will delete all existing tables! Make a backup if needed.

1. In Supabase dashboard, go to **SQL Editor**
2. Click **New Query**
3. Open the file `database-cleanup.sql` in your project
4. Copy the **entire contents** and paste into SQL Editor
5. **Before running**: Check lines 18-22 and add any tables from your old project:
   ```sql
   DROP TABLE IF EXISTS your_old_table_name CASCADE;
   ```
6. Click **Run** or press `Ctrl+Enter`
7. You should see: "Database cleanup complete! Ready for Talazo schema."

---

## Step 3: Install Talazo Database Schema

1. Stay in **SQL Editor**
2. Click **New Query** (or use the same one)
3. Open the file `supabase-schema.sql` in your project
4. Copy the **entire contents** and paste into SQL Editor
5. Click **Run** or press `Ctrl+Enter`
6. You should see: "Success. No rows returned"

---

## Step 4: Verify Database Setup

1. Go to **Table Editor** in Supabase dashboard
2. You should see these tables:
   - ✅ **users** - User profiles
   - ✅ **fields** - Farm fields
   - ✅ **analyses** - Crop analysis results

3. Click on **users** table:
   - Should see columns: id, email, name, farm_name, location, etc.
   - Should be empty (0 rows)

4. Click **Authentication** → **Providers**:
   - Make sure **Email** is enabled (it should be by default)

---

## Step 5: Test Connection

1. Restart your Next.js dev server:
   ```bash
   # Stop current server (Ctrl+C if running)
   npm run dev
   ```

2. Check terminal output:
   - Should see "Environments: .env.local"
   - No Supabase errors

3. Open http://localhost:3000
4. Go to **Sign Up** page
5. Create a test account

6. Verify in Supabase:
   - **Authentication** → should see 1 user
   - **Table Editor** → **users** → should see 1 row

---

## Step 6: Check Security Policies

1. Go to **Authentication** → **Policies**
2. You should see policies for:
   - **users** table (2 policies: SELECT, UPDATE)
   - **fields** table (4 policies: SELECT, INSERT, UPDATE, DELETE)
   - **analyses** table (3 policies: SELECT, INSERT, DELETE)

3. These ensure users can only access their own data

---

## 🎯 What's Different from Firebase?

| Feature | Firebase | Supabase |
|---------|----------|----------|
| Database | Firestore (NoSQL) | PostgreSQL (SQL) |
| Auth | Firebase Auth | Supabase Auth |
| Storage | Cloud Storage | Supabase Storage |
| Free Tier | 50K reads/day | 500MB database |
| Queries | Document-based | SQL queries |
| Real-time | Yes | Yes |

Both work great! Supabase gives you full SQL power.

---

## 🐛 Troubleshooting

### "Invalid API key" or 401 errors:
```bash
# Make sure you copied the ANON key, not the SERVICE_ROLE key
# Check .env.local has no extra spaces
# Restart dev server after adding keys
```

### "relation does not exist" errors:
```sql
-- Schema wasn't created properly
-- Go back to Step 3 and run supabase-schema.sql again
-- Check SQL Editor for error messages
```

### Can't sign up:
```bash
# Check browser console for errors
# Verify Email provider is enabled in Authentication → Providers
# Check Supabase logs: Logs → Auth Logs
```

### Tables missing:
```sql
-- Schema script may have errored
-- Check SQL Editor history for errors
-- Manually verify each CREATE TABLE command ran
```

---

## 📊 Database Structure

### Users Table:
- Links to Supabase Auth
- Stores profile data (name, farm name, location)
- Auto-created on signup via trigger

### Fields Table:
- Each field belongs to a user (`user_id`)
- Stores coordinates (GeoJSON polygon)
- Tracks health status and planting date

### Analyses Table:
- Links to both user and field
- Stores ML analysis results
- Disease, nutrient, and water data

---

## Next Steps

Once everything is connected, I'll help you:
1. ✅ Update login/signup pages to use Supabase
2. ✅ Create field management functions
3. ✅ Migrate localStorage data to Supabase
4. ✅ Add real-time sync
5. ✅ Upload images to Supabase Storage

Let me know once you've:
- ✅ Added credentials to `.env.local`
- ✅ Ran the cleanup script
- ✅ Ran the schema script
- ✅ Verified tables exist

Then we'll connect the app! 🚀
