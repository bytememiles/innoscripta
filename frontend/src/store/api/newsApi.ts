import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type {
  Article,
  Category,
  Source,
  UserPreferences,
  PaginatedResponse,
  ArticleFilters,
  ApiResponse
} from '../../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

export const newsApi = createApi({
  reducerPath: 'newsApi',
  baseQuery: fetchBaseQuery({
    baseUrl: API_BASE_URL,
    prepareHeaders: (headers) => {
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
  endpoints: (builder) => ({
    // Articles
    getArticles: builder.query<PaginatedResponse<Article>, ArticleFilters | void>({
      query: (filters) => {
        const params = new URLSearchParams();
        if (filters) {
          Object.entries(filters).forEach(([key, value]) => {
            if (value !== undefined && value !== null && value !== '') {
              params.append(key, value.toString());
            }
          });
        }
        return `/articles?${params.toString()}`;
      },
      providesTags: ['Article'],
    }),

    getArticle: builder.query<Article, number>({
      query: (id) => `/articles/${id}`,
      transformResponse: (response: ApiResponse<Article>) => response.data,
      providesTags: (_result, _error, id) => [{ type: 'Article', id }],
    }),

    searchArticles: builder.query<PaginatedResponse<Article>, { query: string; filters?: Omit<ArticleFilters, 'search'> }>({
      query: ({ query, filters = {} }) => {
        const params = new URLSearchParams();
        params.append('search', query);
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined && value !== null && value !== '') {
            params.append(key, value.toString());
          }
        });
        return `/articles/search?${params.toString()}`;
      },
      providesTags: ['Article'],
    }),

    getPersonalizedFeed: builder.query<PaginatedResponse<Article>, { page?: number; perPage?: number }>({
      query: ({ page = 1, perPage = 20 }) => `/articles/personalized?page=${page}&per_page=${perPage}`,
      providesTags: ['Article'],
    }),

    getTopHeadlines: builder.query<Article[], number | void>({
      query: (limit = 10) => `/articles/top-headlines?limit=${limit}`,
      transformResponse: (response: ApiResponse<Article[]>) => response.data,
      providesTags: ['Article'],
    }),

    getLatestArticles: builder.query<Article[], number | void>({
      query: (limit = 10) => `/articles/latest?limit=${limit}`,
      transformResponse: (response: ApiResponse<Article[]>) => response.data,
      providesTags: ['Article'],
    }),

    // Categories
    getCategories: builder.query<Category[], void>({
      query: () => '/categories',
      transformResponse: (response: ApiResponse<Category[]>) => response.data,
      providesTags: ['Category'],
    }),

    getCategory: builder.query<Category, number>({
      query: (id) => `/categories/${id}`,
      transformResponse: (response: ApiResponse<Category>) => response.data,
      providesTags: (_result, _error, id) => [{ type: 'Category', id }],
    }),

    // Sources
    getSources: builder.query<Source[], void>({
      query: () => '/sources',
      transformResponse: (response: ApiResponse<Source[]>) => response.data,
      providesTags: ['Source'],
    }),

    getSource: builder.query<Source, number>({
      query: (id) => `/sources/${id}`,
      transformResponse: (response: ApiResponse<Source>) => response.data,
      providesTags: (_result, _error, id) => [{ type: 'Source', id }],
    }),

    // User Preferences
    getUserPreferences: builder.query<UserPreferences, void>({
      query: () => '/user/preferences',
      transformResponse: (response: ApiResponse<UserPreferences>) => response.data,
      providesTags: ['UserPreferences'],
    }),

    updateUserPreferences: builder.mutation<UserPreferences, Partial<Omit<UserPreferences, 'id' | 'user_id' | 'created_at' | 'updated_at'>>>({
      query: (preferences) => ({
        url: '/user/preferences',
        method: 'PUT',
        body: preferences,
      }),
      transformResponse: (response: ApiResponse<UserPreferences>) => response.data,
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
  useGetTopHeadlinesQuery,
  useGetLatestArticlesQuery,
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
