import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env['SUPABASE_URL'];
const supabaseServiceKey = process.env['SUPABASE_SERVICE_ROLE_KEY'];

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Basic database operations
export const createUser = async (email: string, name: string) => {
  const { data, error } = await supabase
    .from('users')
    .insert([{ email, name }])
    .select();
  
  if (error) throw error;
  return data[0];
};

export const createGenerationSession = async (userId: string, prompt: string) => {
  const { data, error } = await supabase
    .from('generation_sessions')
    .insert([{ user_id: userId, prompt }])
    .select();
  
  if (error) throw error;
  return data[0];
};

export const getUserByEmail = async (email: string) => {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('email', email)
    .single();
  
  if (error && error.code !== 'PGRST116') throw error; // PGRST116 is "not found"
  return data;
};
