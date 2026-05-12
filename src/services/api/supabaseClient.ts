import { createClient } from '@supabase/supabase-js';
import Config from 'react-native-config';

const SUPABASE_URL = Config.SUPABASE_URL!;
const SUPABASE_KEY = Config.SUPABASE_KEY!;

export const supabase = createClient(
  SUPABASE_URL,
  SUPABASE_KEY
);