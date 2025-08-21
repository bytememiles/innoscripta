import type {
  ApiResponse,
  Article,
  ArticleFilters,
  Category,
  PaginatedResponse,
  Source,
  UserPreferences,
} from '../types';

import { apiService } from './api';

export class NewsService {
  // Articles
  async getArticles(
    filters?: ArticleFilters
  ): Promise<PaginatedResponse<Article>> {
    const params = new URLSearchParams();

    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params.append(key, value.toString());
        }
      });
    }

    const response = await apiService.get<PaginatedResponse<Article>>(
      `/articles?${params.toString()}`
    );
    return response;
  }

  async getArticle(id: number): Promise<Article> {
    const response = await apiService.get<ApiResponse<{ article: Article }>>(
      `/articles/${id}`
    );
    return response.data.article;
  }

  async searchArticles(
    query: string,
    filters?: Omit<ArticleFilters, 'search'>
  ): Promise<PaginatedResponse<Article>> {
    const params = new URLSearchParams();
    params.append('q', query); // Changed from 'search' to 'q' as per Postman API

    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params.append(key, value.toString());
        }
      });
    }

    const response = await apiService.get<PaginatedResponse<Article>>(
      `/articles/search?${params.toString()}`
    );
    return response;
  }

  async getPersonalizedFeed(
    page = 1,
    perPage = 20,
    fromDate?: string,
    toDate?: string
  ): Promise<PaginatedResponse<Article>> {
    const params = new URLSearchParams();
    params.append('page', page.toString());
    params.append('per_page', perPage.toString());

    if (fromDate) params.append('from_date', fromDate);
    if (toDate) params.append('to_date', toDate);

    const response = await apiService.get<PaginatedResponse<Article>>(
      `/personalized-feed?${params.toString()}`
    );
    return response;
  }

  // Categories
  async getCategories(): Promise<Category[]> {
    const response =
      await apiService.get<ApiResponse<{ categories: Category[] }>>(
        '/categories'
      );
    return response.data.categories;
  }

  async getCategory(id: number): Promise<Category> {
    const response = await apiService.get<ApiResponse<Category>>(
      `/categories/${id}`
    );
    return response.data;
  }

  // Sources
  async getSources(): Promise<Source[]> {
    const response =
      await apiService.get<ApiResponse<{ sources: Source[] }>>('/sources');
    return response.data.sources;
  }

  async getSource(id: number): Promise<Source> {
    const response = await apiService.get<ApiResponse<Source>>(
      `/sources/${id}`
    );
    return response.data;
  }

  // User Preferences
  async getUserPreferences(): Promise<UserPreferences> {
    const response =
      await apiService.get<ApiResponse<{ preferences: UserPreferences }>>(
        '/preferences'
      );
    return response.data.preferences;
  }

  async updateUserPreferences(
    preferences: Partial<
      Omit<UserPreferences, 'id' | 'user_id' | 'created_at' | 'updated_at'>
    >
  ): Promise<UserPreferences> {
    const response = await apiService.post<
      ApiResponse<{ preferences: UserPreferences }>
    >('/preferences', preferences);
    return response.data.preferences;
  }

  // Utility methods using the main getArticles method with filters
  async getArticlesByCategory(
    categorySlug: string,
    page = 1,
    perPage = 20
  ): Promise<PaginatedResponse<Article>> {
    return this.getArticles({
      category: categorySlug,
      page,
      per_page: perPage,
    });
  }

  async getArticlesBySource(
    sourceSlug: string,
    page = 1,
    perPage = 20
  ): Promise<PaginatedResponse<Article>> {
    return this.getArticles({
      source: sourceSlug,
      page,
      per_page: perPage,
    });
  }

  async getArticlesByKeyword(
    keyword: string,
    page = 1,
    perPage = 20
  ): Promise<PaginatedResponse<Article>> {
    return this.getArticles({
      keyword,
      page,
      per_page: perPage,
    });
  }

  async getArticlesByDateRange(
    fromDate: string,
    toDate: string,
    page = 1,
    perPage = 20
  ): Promise<PaginatedResponse<Article>> {
    return this.getArticles({
      from_date: fromDate,
      to_date: toDate,
      page,
      per_page: perPage,
    });
  }
}

export const newsService = new NewsService();
