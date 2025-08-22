import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

import { API_BASE_URL, API_ENDPOINTS } from '../../constants';
import type {
  ApiResponse,
  Article,
  ArticleFilters,
  Category,
  PaginatedResponse,
  Source,
  UserPreferences,
} from '../../types';

export const newsApi = createApi({
  reducerPath: 'newsApi',
  baseQuery: fetchBaseQuery({
    baseUrl: API_BASE_URL,
    prepareHeaders: headers => {
      const token = localStorage.getItem('auth_token');
      if (token) {
        headers.set('authorization', `Bearer ${token}`);
      }
      headers.set('accept', 'application/json');
      headers.set('content-type', 'application/json');
      return headers;
    },
  }),
  tagTypes: ['Article', 'Category', 'Source', 'UserPreferences'],
  endpoints: builder => ({
    // Articles
    getArticles: builder.query<
      PaginatedResponse<Article>,
      ArticleFilters | void
    >({
      query: filters => {
        const params = new URLSearchParams();
        if (filters) {
          Object.entries(filters).forEach(([key, value]) => {
            if (value !== undefined && value !== null && value !== '') {
              params.append(key, value.toString());
            }
          });
        }
        return `${API_ENDPOINTS.ARTICLES}?${params.toString()}`;
      },
      transformResponse: (
        response: ApiResponse<PaginatedResponse<Article>>
      ) => {
        console.log('getArticles response:', response);
        return response.data;
      },
      providesTags: ['Article'],
    }),

    getArticle: builder.query<Article, number>({
      query: id => `${API_ENDPOINTS.ARTICLES}/${id}`,
      transformResponse: (response: ApiResponse<{ article: Article }>) =>
        response.data.article,
      providesTags: (_result, _error, id) => [{ type: 'Article', id }],
    }),

    searchArticles: builder.query<
      PaginatedResponse<Article>,
      { query: string; filters?: Omit<ArticleFilters, 'keyword'> }
    >({
      query: ({ query, filters = {} }) => {
        const params = new URLSearchParams();
        params.append('q', query); // Changed from 'search' to 'q'
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined && value !== null && value !== '') {
            params.append(key, value.toString());
          }
        });
        return `${API_ENDPOINTS.ARTICLE_SEARCH}?${params.toString()}`;
      },
      providesTags: ['Article'],
    }),

    getPersonalizedFeed: builder.query<
      PaginatedResponse<Article>,
      { page?: number; perPage?: number; fromDate?: string; toDate?: string }
    >({
      query: ({ page = 1, perPage = 20, fromDate, toDate }) => {
        const params = new URLSearchParams();
        params.append('page', page.toString());
        params.append('per_page', perPage.toString());
        if (fromDate) params.append('from_date', fromDate);
        if (toDate) params.append('to_date', toDate);
        return `${API_ENDPOINTS.PERSONALIZED_FEED}?${params.toString()}`;
      },
      providesTags: ['Article'],
    }),

    // Categories
    getCategories: builder.query<Category[], void>({
      query: () => API_ENDPOINTS.CATEGORIES,
      transformResponse: (response: ApiResponse<{ categories: Category[] }>) =>
        response.data.categories,
      providesTags: ['Category'],
    }),

    getCategory: builder.query<Category, number>({
      query: id => API_ENDPOINTS.CATEGORY(id),
      transformResponse: (response: ApiResponse<Category>) => response.data,
      providesTags: (_result, _error, id) => [{ type: 'Category', id }],
    }),

    // Sources
    getSources: builder.query<Source[], void>({
      query: () => API_ENDPOINTS.SOURCES,
      transformResponse: (response: ApiResponse<{ sources: Source[] }>) =>
        response.data.sources,
      providesTags: ['Source'],
    }),

    getSource: builder.query<Source, number>({
      query: id => API_ENDPOINTS.SOURCE(id),
      transformResponse: (response: ApiResponse<Source>) => response.data,
      providesTags: (_result, _error, id) => [{ type: 'Source', id }],
    }),

    // User Preferences
    getUserPreferences: builder.query<UserPreferences, void>({
      query: () => API_ENDPOINTS.PREFERENCES,
      transformResponse: (
        response: ApiResponse<{ preferences: UserPreferences }>
      ) => response.data.preferences,
      providesTags: ['UserPreferences'],
    }),

    updateUserPreferences: builder.mutation<
      UserPreferences,
      Partial<
        Omit<UserPreferences, 'id' | 'user_id' | 'created_at' | 'updated_at'>
      >
    >({
      query: preferences => ({
        url: API_ENDPOINTS.PREFERENCES,
        method: 'POST',
        body: preferences,
      }),
      transformResponse: (
        response: ApiResponse<{ preferences: UserPreferences }>
      ) => response.data.preferences,
      invalidatesTags: ['UserPreferences', 'Article'],
    }),
  }),
});

export const {
  // Articles
  useGetArticlesQuery,
  useGetArticleQuery,
  useSearchArticlesQuery,
  useGetPersonalizedFeedQuery,
  useLazyGetArticlesQuery,
  useLazySearchArticlesQuery,

  // Categories
  useGetCategoriesQuery,
  useGetCategoryQuery,

  // Sources
  useGetSourcesQuery,
  useGetSourceQuery,

  // User Preferences
  useGetUserPreferencesQuery,
  useUpdateUserPreferencesMutation,
} = newsApi;
