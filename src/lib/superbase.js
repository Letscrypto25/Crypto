import { createClient } from '@supabase/supabase-js'

// Web app configuration
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseKey = import.meta.env.VITE_SUPABASE_KEY

// Mobile app configuration (Expo/React Native)
// const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL
// const supabaseKey = process.env.EXPO_PUBLIC_SUPABASE_KEY

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase configuration')
}

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    // Recommended for mobile/native apps
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: false, // Disabled for mobile apps
  }
})
