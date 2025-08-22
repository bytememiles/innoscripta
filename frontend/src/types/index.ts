// ==============================|| TYPES - MAIN EXPORTS ||============================== //

// User related types
export type {
  AuthResponse,
  LoginCredentials,
  RegisterCredentials,
  User,
  UserPreferences,
} from './user';

// Article related types
export type {
  Article,
  ArticleFilters,
  Category,
  FilteredArticlesResponse,
  SearchFilters,
  Source,
} from './article';

// API related types
export type {
  ApiEndpoint,
  ApiError,
  ApiResponse,
  AppError,
  AsyncState,
  FilteredArticlesApiResponse,
  HttpMethod,
  LoadingState,
  PaginatedResponse,
} from './api';

// Redux related types
export type {
  AsyncThunkConfig,
  LegacySearchFilters,
  Notification,
  ReduxAction,
  RootState,
  RTKQueryState,
  SelectorReturn,
  SliceConfig,
  ThemeContextType,
  ThemeMode,
  UiState,
} from './redux';

// Re-export everything for backward compatibility
export * from './api';
export * from './article';
export * from './redux';
export * from './user';
