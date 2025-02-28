# Class Schedule Manager - Setup Guide

This guide will help you set up the Class Schedule Manager application with Supabase as the backend.

## Prerequisites

- A Supabase account (sign up at [supabase.com](https://supabase.com) if you don't have one)
- Your Supabase project URL and anon key (found in your project settings)

## Step 1: Create a Supabase Project

1. Log in to your Supabase account at [app.supabase.com](https://app.supabase.com)
2. Click "New Project" and follow the prompts to create a new project
3. Once created, note your project URL and anon key from the API settings

## Step 2: Set Up Database Schema

1. In your Supabase dashboard, go to the "SQL Editor" section
2. Create a new query
3. Copy and paste the contents of `supabase/schema.sql` from this repository
4. Run the SQL query to create the necessary tables and security policies

## Step 3: Configure Authentication

1. In your Supabase dashboard, go to the "Authentication" section
2. Under "Providers", make sure "Email" is enabled
3. Configure any additional settings as needed (password strength, etc.)

## Step 4: Update Configuration

1. Open `js/supabase-config.js` in this project
2. Update the `SUPABASE_URL` and `SUPABASE_KEY` variables with your project's URL and anon key

## Step 5: Test Your Setup

1. Open the `test-auth.html` page in your browser
2. Click "Test Connection" to verify your Supabase connection
3. Create a test account and try to log in
4. Test creating a class to ensure everything is working properly

## Troubleshooting

If you encounter errors:

1. Check the browser console for specific error messages
2. Verify that your Supabase URL and anon key are correct
3. Make sure the schema.sql has been executed successfully
4. Check that you have the correct permissions set up in Supabase

### Common Issues

- **"Failed to save your class"**: This usually means the database schema is not set up correctly or there are permission issues.
- **Authentication errors**: Make sure your Supabase auth settings are properly configured.
- **CORS errors**: Check your Supabase project settings to ensure your domain is allowed.

## Next Steps

Once your setup is complete, you can:

1. Customize the application to fit your needs
2. Add additional features
3. Deploy to a hosting service of your choice

For more information, refer to the [Supabase documentation](https://supabase.com/docs).
