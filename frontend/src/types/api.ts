// ==============================|| API RESPONSE TYPES ||============================== //

// Generic API response wrapper
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

// Paginated response structure (matches Laravel pagination)
export interface PaginatedResponse<T> {
  data: T[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
  from: number | null;
  to: number | null;
  first_page_url: string;
  last_page_url: string;
  next_page_url: string | null;
  prev_page_url: string | null;
  path: string;
  links: any[];
}

// API Error response structure
export interface ApiError {
  message: string;
  errors?: Record<string, string[]>;
}

// Common app error interface
export interface AppError {
  message: string;
  code?: string | number;
}

// Loading state interface
export interface LoadingState {
  isLoading: boolean;
  error: string | null;
}

// Generic async operation state
export interface AsyncState<T = any> {
  data: T | null;
  isLoading: boolean;
  error: string | null;
  lastUpdated?: string;
}

// HTTP method types
export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

// API endpoint configuration
export interface ApiEndpoint {
  url: string;
  method: HttpMethod;
  requiresAuth?: boolean;
}
