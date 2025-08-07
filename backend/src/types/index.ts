// User types
export interface User {
  id: string;
  email: string;
  name: string | null;
  created_at: string;
}

// Generation session types
export interface GenerationSession {
  id: string;
  user_id: string;
  prompt: string;
  created_at: string;
}

// Domain suggestion types
export interface DomainSuggestion {
  id: string;
  session_id: string;
  domain_name: string;
  is_available: boolean | null;
  created_at: string;
}

// API response types
export interface ApiResponse<T> {
  status: 'success' | 'error';
  data?: T;
  error?: string;
}

// Request types
export interface GenerateDomainsRequest {
  prompt: string;
  user_id?: string;
}

export interface CheckAvailabilityRequest {
  domain_name: string;
}
