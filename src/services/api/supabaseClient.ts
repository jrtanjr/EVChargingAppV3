import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://alvdbsxfgkurozjyxqqy.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFsdmRic3hmZ2t1cm96anl4cXF5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc1MjM4NDEsImV4cCI6MjA5MzA5OTg0MX0.1oIAwQCmlZx68n75GOOgD4QKIPsOsF2H9H9vn5VPU1o';

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);