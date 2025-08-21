// User types
export interface User {
  id: number;
  name: string;
  email: string;
  email_verified_at?: string;
  created_at: string;
  updated_at: string;
}

export interface UserPreferences {
  id: number;
  user_id: number;
  preferred_sources: number[] | null;
  preferred_categories: number[] | null;
  preferred_authors: string[] | null;
  preferred_language: string;
  preferred_country: string | null;
  created_at: string;
  updated_at: string;
}

// Article types
export interface Article {
  id: number;
  title: string;
  description: string | null;
  content: string | null;
  url: string;
  url_to_image: string | null;
  published_at: string;
  author: string | null;
  source_id: number;
  category_id: number | null;
  language: string;
  country: string | null;
  external_id: string | null;
  metadata: Record<string, any> | null;
  created_at: string;
  updated_at: string;
  source?: Source;
  category?: Category;
}

// Source types
export interface Source {
  id: number;
  name: string;
  api_name: string;
  base_url: string | null;
  description: string | null;
  language: string;
  country: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// Category types
export interface Category {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// Auth types
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

// API Response types
export interface PaginatedResponse<T> {
  data: T[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
  from: number | null;
  to: number | null;
}

export interface ApiResponse<T> {
  data: T;
  message?: string;
}

export interface ApiError {
  message: string;
  errors?: Record<string, string[]>;
}

// Filter types
export interface ArticleFilters {
  search?: string;
  category_id?: number;
  source_id?: number;
  from_date?: string;
  to_date?: string;
  author?: string;
  page?: number;
  per_page?: number;
}

// Theme types
export type ThemeMode = 'light' | 'dark';

export interface ThemeContextType {
  mode: ThemeMode;
  toggleTheme: () => void;
}

// App types
export interface LoadingState {
  isLoading: boolean;
  error: string | null;
}

export interface AppError {
  message: string;
  code?: string | number;
}
