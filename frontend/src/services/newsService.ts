import { apiService } from './api';
import type {
  Article,
  Category,
  Source,
  UserPreferences,
  PaginatedResponse,
  ArticleFilters,
  ApiResponse
} from '../types';

export class NewsService {
  // Articles
  async getArticles(filters?: ArticleFilters): Promise<PaginatedResponse<Article>> {
    const params = new URLSearchParams();
    
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params.append(key, value.toString());
        }
      });
    }
    
    const response = await apiService.get<PaginatedResponse<Article>>(`/articles?${params.toString()}`);
    return response;
  }

  async getArticle(id: number): Promise<Article> {
    const response = await apiService.get<ApiResponse<Article>>(`/articles/${id}`);
    return response.data;
  }

  async searchArticles(query: string, filters?: Omit<ArticleFilters, 'search'>): Promise<PaginatedResponse<Article>> {
    const params = new URLSearchParams();
    params.append('search', query);
    
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params.append(key, value.toString());
        }
      });
    }
    
    const response = await apiService.get<PaginatedResponse<Article>>(`/articles/search?${params.toString()}`);
    return response;
  }

  async getPersonalizedFeed(page = 1, perPage = 20): Promise<PaginatedResponse<Article>> {
    const params = new URLSearchParams();
    params.append('page', page.toString());
    params.append('per_page', perPage.toString());
    
    const response = await apiService.get<PaginatedResponse<Article>>(`/articles/personalized?${params.toString()}`);
    return response;
  }

  // Categories
  async getCategories(): Promise<Category[]> {
    const response = await apiService.get<ApiResponse<Category[]>>('/categories');
    return response.data;
  }

  async getCategory(id: number): Promise<Category> {
    const response = await apiService.get<ApiResponse<Category>>(`/categories/${id}`);
    return response.data;
  }

  // Sources
  async getSources(): Promise<Source[]> {
    const response = await apiService.get<ApiResponse<Source[]>>('/sources');
    return response.data;
  }

  async getSource(id: number): Promise<Source> {
    const response = await apiService.get<ApiResponse<Source>>(`/sources/${id}`);
    return response.data;
  }

  // User Preferences
  async getUserPreferences(): Promise<UserPreferences> {
    const response = await apiService.get<ApiResponse<UserPreferences>>('/user/preferences');
    return response.data;
  }

  async updateUserPreferences(preferences: Partial<Omit<UserPreferences, 'id' | 'user_id' | 'created_at' | 'updated_at'>>): Promise<UserPreferences> {
    const response = await apiService.put<ApiResponse<UserPreferences>>('/user/preferences', preferences);
    return response.data;
  }

  // Utility methods
  async getTopHeadlines(limit = 10): Promise<Article[]> {
    const response = await apiService.get<ApiResponse<Article[]>>(`/articles/top-headlines?limit=${limit}`);
    return response.data;
  }

  async getLatestArticles(limit = 10): Promise<Article[]> {
    const response = await apiService.get<ApiResponse<Article[]>>(`/articles/latest?limit=${limit}`);
    return response.data;
  }

  async getArticlesByCategory(categoryId: number, page = 1, perPage = 20): Promise<PaginatedResponse<Article>> {
    const params = new URLSearchParams();
    params.append('category_id', categoryId.toString());
    params.append('page', page.toString());
    params.append('per_page', perPage.toString());
    
    const response = await apiService.get<PaginatedResponse<Article>>(`/articles?${params.toString()}`);
    return response;
  }

  async getArticlesBySource(sourceId: number, page = 1, perPage = 20): Promise<PaginatedResponse<Article>> {
    const params = new URLSearchParams();
    params.append('source_id', sourceId.toString());
    params.append('page', page.toString());
    params.append('per_page', perPage.toString());
    
    const response = await apiService.get<PaginatedResponse<Article>>(`/articles?${params.toString()}`);
    return response;
  }
}

export const newsService = new NewsService();
