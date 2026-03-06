# Database Migrations

## How to Apply Migrations

These migrations need to be run in your Supabase SQL Editor:

1. Go to [supabase.com](https://supabase.com)
2. Select your project
3. Navigate to **SQL Editor** in the left sidebar
4. Copy and paste the migration SQL from the files below
5. Click **Run** to apply the migration

## Available Migrations

### `add_interested_status.sql`

**Purpose**: Adds the 'interested' status to the members table to support users who want to stay informed about a trip but aren't ready to commit yet.

**Status Values**:
- `pending` - Member created but payment not completed
- `committed` - Member has paid deposit and is part of the trip
- `withdrawn` - Member has withdrawn from the trip
- `interested` - Member wants updates but hasn't committed yet (no payment required)

**Run this migration** if you're adding the improved invite flow feature.
