// ==============================|| ROUTE CONSTANTS ||============================== //

// Base paths
export const ROUTES = {
  // Root redirects
  ROOT: '/',
  APP: '/news',
  AUTH: '/auth',

  // Main news routes
  HOME: '/news',
  SEARCH: '/news/search',
  PROFILE: '/news/profile',
  ARTICLE: '/news/article',

  // Auth routes
  LOGIN: '/auth/login',
  REGISTER: '/auth/register',
  FORGOT_PASSWORD: '/auth/forgot-password',

  // Dynamic routes
  ARTICLE_DETAIL: (id: string | number) => `/news/article/${id}`,
} as const;

// Route names for navigation
export const ROUTE_NAMES = {
  HOME: 'Home',
  SEARCH: 'Search',
  PROFILE: 'Profile',
  LOGIN: 'Login',
  REGISTER: 'Register',
  FORGOT_PASSWORD: 'Forgot Password',
} as const;

// Navigation items configuration
export const NAVIGATION_ITEMS = [
  { text: ROUTE_NAMES.HOME, path: ROUTES.HOME },
  { text: ROUTE_NAMES.SEARCH, path: ROUTES.SEARCH },
  { text: ROUTE_NAMES.PROFILE, path: ROUTES.PROFILE },
] as const;

// Auth redirect paths
export const AUTH_REDIRECTS = {
  DEFAULT_AUTHENTICATED: ROUTES.APP,
  DEFAULT_GUEST: ROUTES.LOGIN,
} as const;
