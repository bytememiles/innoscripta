// ==============================|| USER TYPES ||============================== //

export interface User {
  id: string;
  name: string;
  email: string;
  email_verified_at?: string;
  created_at: string;
  updated_at: string;
}

export interface UserPreferences {
  id: string;
  user_id: string;
  preferred_categories: string[] | null; // Changed to string array (slugs)
  preferred_sources: string[] | null; // Changed to string array (slugs)
  preferred_authors: string[] | null;
  preferred_language: string | null;
  preferred_country: string | null;
  email_notifications?: boolean;
  timezone?: string;
  created_at: string;
  updated_at: string;
}

// Auth related types
export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}
