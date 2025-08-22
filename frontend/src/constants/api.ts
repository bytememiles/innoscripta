// ==============================|| API ENDPOINT CONSTANTS ||============================== //

// Base API URL
export const API_BASE_URL =
  import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

// API endpoints
export const API_ENDPOINTS = {
  // Authentication
  LOGIN: '/login',
  REGISTER: '/register',
  LOGOUT: '/logout',
  USER: '/user',
  FORGOT_PASSWORD: '/forgot-password',
  RESET_PASSWORD: '/reset-password',

  // Articles
  ARTICLES: '/articles',
  ARTICLE_SEARCH: '/articles/search',
  FILTERED_ARTICLES: '/articles/filtered',

  // User preferences
  PREFERENCES: '/preferences',
  PERSONALIZED_FEED: '/personalized-feed',

  // Categories and sources
  CATEGORIES: '/categories',
  CATEGORY: (id: string | number) => `/categories/${id}`,
  SOURCES: '/sources',
  SOURCE: (id: string | number) => `/sources/${id}`,
} as const;

// HTTP methods
export const HTTP_METHODS = {
  GET: 'GET',
  POST: 'POST',
  PUT: 'PUT',
  PATCH: 'PATCH',
  DELETE: 'DELETE',
} as const;

// API response status codes
export const API_STATUS_CODES = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  UNPROCESSABLE_ENTITY: 422,
  INTERNAL_SERVER_ERROR: 500,
} as const;

// Default API configuration
export const API_CONFIG = {
  TIMEOUT: 10000, // 10 seconds
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000, // 1 second
} as const;
