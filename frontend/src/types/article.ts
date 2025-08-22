// ==============================|| ARTICLE TYPES ||============================== //

// Core article interface
export interface Article {
  id: string;
  title: string;
  description: string | null;
  content: string | null;
  url: string;
  url_to_image: string | null;
  published_at: string;
  author: string | null;
  source_id: string;
  category_id: string | null;
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
  id: string;
  name: string;
  slug: string;
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
  id: string;
  name: string;
  slug: string;
  description: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// Filter types
export interface ArticleFilters {
  page?: number;
  per_page?: number;
  category?: string; // Changed to slug-based filtering
  source?: string; // Changed to slug-based filtering
  from_date?: string; // Date in Y-m-d format
  to_date?: string; // Date in Y-m-d format
  keyword?: string; // For keyword search in title/description
}

// Search related types
export interface SearchFilters extends Omit<ArticleFilters, 'keyword'> {
  // Additional search-specific filters can be added here
}
