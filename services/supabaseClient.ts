
import { createClient } from '@supabase/supabase-js';
import { config } from '../config';

// We use placeholders if keys are missing to prevent the "supabaseUrl is required" error 
// that crashes the container on startup.
const url = config.supabaseUrl || 'https://placeholder.supabase.co';
const key = config.supabaseKey || 'placeholder-key';

export const supabase = createClient(url, key);
