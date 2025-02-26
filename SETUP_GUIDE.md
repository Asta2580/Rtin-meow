# Class Schedule Manager - Setup Guide

This guide will help you set up the Class Schedule Manager application with Supabase backend.

## Prerequisites

- A Supabase account (free tier is sufficient)
- A web server to host the application (or you can use GitHub Pages)

## Supabase Setup

1. Create a new Supabase project at [https://app.supabase.com](https://app.supabase.com)

2. Once your project is created, go to the SQL Editor in the Supabase dashboard

3. Create a new query and paste the contents of `supabase/schema.sql` to set up the database schema

4. Execute the SQL query to create the necessary tables and security policies

5. Go to the Authentication section and set up authentication:
   - Enable Email/Password sign-up method
   - Configure any additional authentication providers if needed

6. Go to Project Settings > API to get your API credentials:
   - Copy the URL (e.g., `https://yourproject.supabase.co`)
   - Copy the `anon` public API key

7. Open `js/supabase-config.js` and update the following variables:
   ```javascript
   const SUPABASE_URL = 'YOUR_SUPABASE_URL'; // Replace with your URL
   const SUPABASE_KEY = 'YOUR_SUPABASE_ANON_KEY'; // Replace with your anon key
   ```

## Hosting the Application

### Option 1: Local Development

1. Use a local web server like [Live Server](https://marketplace.visualstudio.com/items?itemName=ritwickdey.LiveServer) for VS Code

2. Open the project folder and start the server

3. Access the application at `http://localhost:5500` (or whatever port your server uses)

### Option 2: GitHub Pages

1. Create a new GitHub repository

2. Push your code to the repository

3. Go to Settings > Pages

4. Select the main branch as the source and save

5. Your site will be published at `https://yourusername.github.io/repository-name/`

### Option 3: Web Hosting

1. Upload the files to your web hosting service using FTP or their provided tools

2. Access your application at your domain

## Testing Notifications

To test browser notifications:

1. Open the application in Chrome on your Android device
2. Allow notifications when prompted
3. Add a class that starts within the next 15 minutes
4. You should receive a notification 15 minutes before the class starts

## Troubleshooting

- **Notifications not working**: Make sure notifications are enabled in your browser settings
- **Database errors**: Check the browser console for error messages and verify your Supabase credentials
- **Authentication issues**: Ensure your Supabase project has the correct authentication settings

## Next Steps

- Consider adding a login/signup page for better user management
- Implement data export/import functionality
- Add calendar integration with Google Calendar or other services
