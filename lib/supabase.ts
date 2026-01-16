
import { createClient } from '@supabase/supabase-js';

// The reference 'xlholuueurpymoznrpyc' is extracted from the JWT (Anon Key) provided.
const supabaseUrl = 'https://xlholuueurpymoznrpyc.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhsaG9sdXVldXJweW1vem5ycHljIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjgyMzcxMTYsImV4cCI6MjA4MzgxMzExNn0.6e4fhldpA7v4woCbxkXAhJ-GWo-kRx45TuWbWqYReMA';

export const supabase = createClient(supabaseUrl, supabaseKey);
