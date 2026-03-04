# Database Setup Instructions

## Problem
You're getting "Failed to create trip" because the database tables don't exist yet.

## Solution
Run the database schema in Supabase:

### Step 1: Go to Supabase SQL Editor
1. Visit https://supabase.com/dashboard
2. Select your project: `hzfzuzvcxvhhxtutcvqi`
3. Click **SQL Editor** in the left sidebar
4. Click **New query**

### Step 2: Copy the Schema
Open the file: `supabase/schema.sql` (in this project)

### Step 3: Run the Schema
1. Copy ALL the contents of `supabase/schema.sql`
2. Paste it into the Supabase SQL Editor
3. Click **RUN** (or press Cmd/Ctrl + Enter)
4. Wait for success message: "Success. No rows returned"

### Step 4: Test
1. Go back to your app: https://rally-a9c01qi3t-enyabutis-projects.vercel.app/create
2. Try creating a trip again
3. It should now redirect you to the trip page!

## What This Creates
The schema creates 5 database tables:
- `trips` - Trip information
- `members` - People who join trips
- `preferences` - Travel preferences
- `options` - AI-generated itineraries
- `votes` - Member votes on options

After running this once, you won't need to run it again - the tables will persist in your Supabase database.
