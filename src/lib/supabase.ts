import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface Category {
  id: string;
  name: string;
  icon: string;
  created_at: string;
}

export interface AITool {
  id: string;
  name: string;
  description: string;
  category_id: string;
  website_url: string;
  logo_url: string | null;
  created_at: string;
}
