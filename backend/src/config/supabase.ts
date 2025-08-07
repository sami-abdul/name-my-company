import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env['SUPABASE_URL'];
const supabaseServiceKey = process.env['SUPABASE_SERVICE_ROLE_KEY'];

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error('Missing Supabase environment variables');
}

// Service role client for server-side operations
export const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

// Client for user authentication (uses anon key)
const supabaseAnonKey = process.env['SUPABASE_ANON_KEY'];
if (!supabaseAnonKey) {
  throw new Error('Missing SUPABASE_ANON_KEY environment variable');
}

export const supabaseAuth = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true
  }
});

// Enhanced database operations with better error handling and retry logic

// Input validation helper
const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email) && email.length <= 255;
};

const validateString = (str: string, maxLength: number = 255): boolean => {
  return typeof str === 'string' && str.trim().length > 0 && str.length <= maxLength;
};

export const createUser = async (email: string, name: string) => {
  try {
    // Validate inputs before database operation
    if (!validateEmail(email)) {
      throw new Error('Invalid email format or length');
    }
    
    if (!validateString(name, 255)) {
      throw new Error('Invalid name format or length');
    }

    const { data, error } = await supabase
      .from('users')
      .insert([{ email: email.toLowerCase().trim(), name: name.trim() }])
      .select()
      .single();
    
    if (error) {
      // Don't log sensitive database details in production
      const isProduction = process.env.NODE_ENV === 'production';
      if (!isProduction) {
        console.error('Database error creating user:', error);
      }
      throw new Error('Failed to create user');
    }
    return data;
  } catch (error) {
    console.error('Error in createUser:', error instanceof Error ? error.message : 'Unknown error');
    throw error;
  }
};

export const createGenerationSession = async (
  userId: string, 
  prompt: string, 
  modelUsed: string = 'gpt-4o-mini'
) => {
  try {
    // Validate inputs
    if (!userId || typeof userId !== 'string') {
      throw new Error('Invalid user ID');
    }
    
    if (!validateString(prompt, 500)) {
      throw new Error('Invalid prompt format or length (max 500 characters)');
    }
    
    if (!validateString(modelUsed, 100)) {
      throw new Error('Invalid model name');
    }

    const { data, error } = await supabase
      .from('generation_sessions')
      .insert([{ 
        user_id: userId.trim(), 
        prompt: prompt.trim(), 
        model_used: modelUsed.trim() 
      }])
      .select()
      .single();
    
    if (error) {
      const isProduction = process.env.NODE_ENV === 'production';
      if (!isProduction) {
        console.error('Database error creating generation session:', error);
      }
      throw new Error('Failed to create generation session');
    }
    return data;
  } catch (error) {
    console.error('Error in createGenerationSession:', error instanceof Error ? error.message : 'Unknown error');
    throw error;
  }
};

export const saveDomainSuggestions = async (
  sessionId: string, 
  domains: string[]
) => {
  try {
    // Validate inputs
    if (!sessionId || typeof sessionId !== 'string') {
      throw new Error('Invalid session ID');
    }
    
    if (!Array.isArray(domains) || domains.length === 0) {
      throw new Error('Invalid domains array');
    }
    
    // Validate each domain
    const validDomains = domains.filter(domain => {
      if (typeof domain !== 'string' || domain.trim().length === 0) {
        return false;
      }
      // Basic domain validation - alphanumeric, hyphens, dots only
      const domainRegex = /^[a-zA-Z0-9.-]+$/;
      return domainRegex.test(domain) && domain.length <= 255;
    });
    
    if (validDomains.length === 0) {
      throw new Error('No valid domains provided');
    }

    const domainData = validDomains.map(domain => ({
      session_id: sessionId.trim(),
      domain_name: domain.trim().toLowerCase()
    }));

    const { data, error } = await supabase
      .from('domain_suggestions')
      .insert(domainData)
      .select();
    
    if (error) {
      const isProduction = process.env.NODE_ENV === 'production';
      if (!isProduction) {
        console.error('Database error saving domain suggestions:', error);
      }
      throw new Error('Failed to save domain suggestions');
    }
    return data;
  } catch (error) {
    console.error('Error in saveDomainSuggestions:', error instanceof Error ? error.message : 'Unknown error');
    throw error;
  }
};

export const updateDomainAvailability = async (
  domainName: string, 
  isAvailable: boolean
) => {
  try {
    const { data, error } = await supabase
      .from('domain_suggestions')
      .update({ 
        is_available: isAvailable,
        checked_at: new Date().toISOString()
      })
      .eq('domain_name', domainName)
      .select();
    
    if (error) {
      console.error('Database error updating domain availability:', error);
      throw new Error(`Failed to update domain availability: ${error.message}`);
    }
    return data;
  } catch (error) {
    console.error('Error in updateDomainAvailability:', error);
    throw error;
  }
};

export const getUserByEmail = async (email: string) => {
  try {
    // Validate email input
    if (!validateEmail(email)) {
      throw new Error('Invalid email format');
    }

    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email.toLowerCase().trim())
      .single();
    
    if (error && error.code !== 'PGRST116') {
      const isProduction = process.env.NODE_ENV === 'production';
      if (!isProduction) {
        console.error('Database error getting user by email:', error);
      }
      throw new Error('Failed to get user');
    }
    return data;
  } catch (error) {
    console.error('Error in getUserByEmail:', error instanceof Error ? error.message : 'Unknown error');
    throw error;
  }
};

export const getUserSessions = async (userId: string, limit: number = 10) => {
  try {
    const { data, error } = await supabase
      .from('generation_sessions')
      .select(`
        *,
        domain_suggestions (*)
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit);
    
    if (error) {
      console.error('Database error getting user sessions:', error);
      throw new Error(`Failed to get user sessions: ${error.message}`);
    }
    return data;
  } catch (error) {
    console.error('Error in getUserSessions:', error);
    throw error;
  }
};

// Health check for database connection
export const checkDatabaseConnection = async () => {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('count')
      .limit(1);
    
    if (error) {
      console.error('Database connection check failed:', error);
      return false;
    }
    return true;
  } catch (error) {
    console.error('Database connection error:', error);
    return false;
  }
};
