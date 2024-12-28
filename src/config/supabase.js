import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://txvayohfwanumggxbdnq.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR4dmF5b2hmd2FudW1nZ3hiZG5xIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzUzNzI3NzMsImV4cCI6MjA1MDk0ODc3M30.gQmymwM5kW7OciWCsX2YKaBQBTTArHsyyo60umGQMN8';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
});
