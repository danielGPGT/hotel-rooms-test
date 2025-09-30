# Hotel Rooms Management System - Setup Guide

## Prerequisites

1. **Node.js** (v18 or higher)
2. **Supabase Account** - Sign up at [supabase.com](https://supabase.com)

## Step 1: Supabase Setup

### 1.1 Create a Supabase Project
1. Go to [supabase.com](https://supabase.com) and sign up/login
2. Click "New Project"
3. Choose your organization and enter project details
4. Wait for the project to be created

### 1.2 Get Your Credentials
1. Go to your project dashboard
2. Click on "Settings" → "API"
3. Copy your:
   - **Project URL** (looks like: `https://your-project-id.supabase.co`)
   - **anon public key** (long string starting with `eyJ...`)

## Step 2: Environment Variables

### Option A: Using .env file (Recommended)
1. Create a `.env` file in the project root
2. Add your Supabase credentials:
```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

### Option B: Direct in script
Edit `src/scripts/seedDatabase.js` and replace lines 4-5:
```javascript
const supabaseUrl = 'https://your-project-id.supabase.co'
const supabaseAnonKey = 'your-anon-key-here'
```

## Step 3: Database Schema

### 3.1 Run the SQL Schema
1. Go to your Supabase project dashboard
2. Click on "SQL Editor"
3. Copy and paste the contents of `database-test/hotel-tables.sql`
4. Click "Run" to create the tables

### 3.2 Verify Tables Created
You should see these tables in your database:
- `hotels`
- `tours` 
- `hotel_contracts`
- `tour_room_inventory`
- `room_rates`

## Step 4: Seed the Database

### 4.1 Install Dependencies
```bash
npm install
```

### 4.2 Run the Seeding Script
```bash
npm run seed
```

You should see output like:
```
🌱 Starting database seeding...
📝 Inserting hotels...
✅ Hotels inserted successfully
📝 Inserting tours...
✅ Tours inserted successfully
📝 Inserting contracts...
✅ Contracts inserted successfully
📝 Inserting inventory...
✅ Inventory inserted successfully
📝 Inserting rates...
✅ Rates inserted successfully
🎉 Database seeding completed successfully!
```

## Step 5: Start the Application

```bash
npm run dev
```

The application will be available at `http://localhost:5173`

## Troubleshooting

### Error: "Invalid supabaseUrl"
- Check that your Supabase URL starts with `https://`
- Make sure there are no extra spaces in your `.env` file
- Verify the URL is correct in your Supabase dashboard

### Error: "Missing Supabase credentials"
- Make sure your `.env` file is in the project root
- Check that the variable names are exactly: `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`
- Restart your terminal after creating the `.env` file

### Error: "relation does not exist"
- Make sure you've run the SQL schema first
- Check that all tables were created successfully in Supabase

### Error: "insufficient privileges"
- Check your Supabase RLS (Row Level Security) policies
- Make sure the anon key has insert permissions
- You may need to disable RLS temporarily for seeding

## Next Steps

Once everything is set up:

1. **Explore the Application**: Navigate through Hotels, Tours, Contracts, Inventory, and Rates
2. **Test CRUD Operations**: Try creating, editing, and deleting records
3. **Use the Pricing Sandbox**: Test the quote building functionality
4. **Customize Data**: Modify the seeding script to add your own data

## Support

If you encounter issues:
1. Check the console for error messages
2. Verify your Supabase credentials
3. Ensure the database schema is properly set up
4. Check the Supabase dashboard for any errors