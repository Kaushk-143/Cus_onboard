# Cus-onboarding Application

## Setup Instructions

1. **Create a Supabase project:**
   - Go to [Supabase](https://supabase.com/) and create a new project
   - Note your project URL and anon key from the project settings

2. **Configure environment variables:**
   - Copy `.env.example` to `.env`:
     ```bash
     cp .env.example .env
     ```
   - Update the `.env` file with your Supabase credentials:
     ```bash
     VITE_SUPABASE_URL=https://your-project-ref.supabase.co
     VITE_SUPABASE_ANON_KEY=your-anon-key-here
     ```

3. **Install dependencies:**
   ```bash
   npm install
   ```

4. **Run the development server:**
   ```bash
   npm run dev
   ```

## Supabase Configuration

The application uses environment variables for Supabase configuration. These are loaded at build time and are required for the application to function properly.

### Required Environment Variables

- `VITE_SUPABASE_URL`: Your Supabase project URL (e.g., `https://abcdefghijklmnop.supabase.co`)
- `VITE_SUPABASE_ANON_KEY`: Your Supabase anon key (JWT token)

### How to Get Your Supabase Credentials

1. Go to your [Supabase Dashboard](https://app.supabase.com/)
2. Select your project
3. Go to Project Settings → API
4. Copy the Project URL and Project API keys (use the `anon` `public` key)

### Security Notes

- Never commit your `.env` file to version control
- The `.env.example` file shows the expected format without exposing actual credentials
- Environment variables prefixed with `VITE_` are exposed to the client-side code

## Troubleshooting

### Common Issues

1. **"AuthProvider: Loading timeout reached" Error:**
   - Check your internet connection
   - Verify your Supabase URL and anon key in the `.env` file
   - Make sure you're not using placeholder values
   - Check the browser console for detailed error messages

2. **Invalid Supabase Configuration:**
   - Ensure your Supabase URL follows the format: `https://your-project-ref.supabase.co`
   - Verify your anon key is correct

3. **Network Connectivity Issues:**
   - Check if you're behind a firewall or proxy
   - Try accessing the Supabase URL directly in your browser

### Running Diagnostics

To run the built-in diagnostics tools:

1. **Complete Application Diagnosis:**
   ```bash
   npm run dev
   ```
   Then check the browser console for diagnostic output.

2. **Manual Diagnosis:**
   You can also run specific diagnostic files:
   - `src/diagnose-auth-flow.ts` - Auth flow diagnosis
   - `src/diagnose-network.ts` - Network connectivity diagnosis
   - `src/diagnose-complete.ts` - Complete application diagnosis

### Database Setup

Make sure your Supabase database has the required tables. Run the SQL migrations in the `supabase/migrations` directory:

1. Go to your Supabase project dashboard
2. Navigate to SQL Editor
3. Run the migration files from the `supabase/migrations` directory

## Development

### Available Scripts

- `npm run dev` - Start the development server
- `npm run build` - Build for production
- `npm run preview` - Preview the production build
- `npm run lint` - Run ESLint
- `npm run typecheck` - Run TypeScript type checking

### Project Structure

```
src/
├── components/     # React components
├── hooks/          # Custom React hooks
├── lib/            # Library files (Supabase client)
├── utils/          # Utility functions
├── App.tsx         # Main App component
├── main.tsx        # Entry point
└── ...             # Other files
```