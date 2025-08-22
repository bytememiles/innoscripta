<?php

namespace App\Services;

use App\Models\Article;
use App\Models\Category;
use App\Models\Source;
use App\Models\UserPreference;
use App\Services\NewsAPIs\NewsAPIService;
use App\Services\NewsAPIs\NewsDataService;
use App\Services\NewsAPIs\NYTimesService;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;
use Illuminate\Support\Str;

class NewsScrapingService
{
    private NewsAPIService $newsAPIService;
    private NewsDataService $newsDataService;
    private NYTimesService $nyTimesService;
    
    // Rate limiting constants
    private const MAX_REQUESTS_PER_MINUTE = 30;
    private const MAX_REQUESTS_PER_HOUR = 300;
    private const MAX_DATE_RANGE_DAYS = 30;
    private const MAX_ARTICLES_PER_REQUEST = 100;
    
    // Cache keys for rate limiting
    private const RATE_LIMIT_MINUTE_KEY = 'news_scraping_rate_limit_minute';
    private const RATE_LIMIT_HOUR_KEY = 'news_scraping_rate_limit_hour';
    private const SCRAPING_LOCK_KEY = 'news_scraping_lock';

    public function __construct()
    {
        $this->newsAPIService = new NewsAPIService();
        $this->newsDataService = new NewsDataService();
        $this->nyTimesService = new NYTimesService();
    }

    /**
     * Scrape news based on user preferences or default preferences
     */
    public function scrapeForUser(int $userId, bool $forceRefresh = false): array
    {
        // Handle default case (when userId is 0 or null)
        if ($userId <= 0) {
            return $this->scrapeDefaultNews($forceRefresh);
        }
        
        $userPreferences = UserPreference::where('user_id', $userId)->first();
        
        if ($userPreferences && !empty($userPreferences->preferred_categories)) {
            return $this->scrapeByPreferences($userPreferences, $forceRefresh);
        }
        
        // Fallback to default preferences
        return $this->scrapeDefaultNews($forceRefresh);
    }

    /**
     * Scrape news based on search query with rate limiting and security
     */
    public function scrapeForSearch(string $query, array $filters = [], ?int $userId = null): array
    {
        // Check rate limiting
        if (!$this->checkRateLimit($userId)) {
            throw new \Exception('Rate limit exceeded. Please try again later.');
        }

        // Validate and sanitize filters
        $sanitizedFilters = $this->sanitizeFilters($filters);
        
        // Check if we have recent results for this query
        $cacheKey = $this->generateSearchCacheKey($query, $sanitizedFilters);
        $cachedResults = Cache::get($cacheKey);
        
        if ($cachedResults && !$this->shouldRefreshCache($cachedResults)) {
            return $cachedResults;
        }

        // Check for existing articles that match the search
        $existingArticles = $this->findExistingArticles($query, $sanitizedFilters);
        
        if (count($existingArticles) >= 20) {
            // We have enough recent articles, just return them
            Cache::put($cacheKey, $existingArticles, now()->addMinutes(15));
            return $existingArticles;
        }

        // Scrape new articles
        $newArticles = $this->scrapeBySearchQuery($query, $sanitizedFilters);
        
        // Merge and deduplicate
        $allArticles = $this->mergeAndDeduplicateArticles($existingArticles, $newArticles);
        
        // Cache results
        Cache::put($cacheKey, $allArticles, now()->addMinutes(15));
        
        return $allArticles;
    }

    /**
     * Scrape news based on user preferences
     */
    private function scrapeByPreferences(UserPreference $preferences, bool $forceRefresh = false): array
    {
        $articles = [];
        
        // Get preferred sources
        $sources = Source::whereIn('slug', $preferences->preferred_sources ?? [])->get();
        
        foreach ($sources as $source) {
            try {
                $sourceArticles = $this->scrapeFromSource($source, $preferences, $forceRefresh);
                $articles = array_merge($articles, $sourceArticles);
            } catch (\Exception $e) {
                Log::error("Failed to scrape from source: {$source->name}", [
                    'error' => $e->getMessage(),
                    'source_id' => $source->id
                ]);
            }
        }
        
        return $articles;
    }

    /**
     * Scrape default news (general categories)
     */
    private function scrapeDefaultNews(bool $forceRefresh = false): array
    {
        $defaultCategories = ['general', 'technology', 'business', 'sports'];
        $articles = [];
        
        foreach ($defaultCategories as $categorySlug) {
            $category = Category::where('slug', $categorySlug)->first();
            if ($category) {
                try {
                    $categoryArticles = $this->scrapeByCategory($category, $forceRefresh);
                    $articles = array_merge($articles, $categoryArticles);
                } catch (\Exception $e) {
                    Log::error("Failed to scrape category: {$categorySlug}", [
                        'error' => $e->getMessage()
                    ]);
                }
            }
        }
        
        return $articles;
    }

    /**
     * Scrape articles from a specific source
     */
    private function scrapeFromSource(Source $source, UserPreference $preferences, bool $forceRefresh = false): array
    {
        $cacheKey = "source_articles_{$source->id}_" . md5(json_encode($preferences->preferred_categories));
        
        if (!$forceRefresh && Cache::has($cacheKey)) {
            return Cache::get($cacheKey);
        }

        $articles = [];
        
        switch ($source->api_name) {
            case 'newsapi':
                $articles = $this->newsAPIService->fetchTopHeadlines([
                    'category' => implode(',', $preferences->preferred_categories ?? []),
                    'pageSize' => 50
                ]);
                break;
                
            case 'newsdata':
                $articles = $this->newsDataService->fetchLatestNews($preferences->preferred_categories ?? []);
                break;
                
            case 'nyt':
                $articles = $this->nyTimesService->fetchTopStories();
                break;
        }
        
        // Save articles to database
        $savedArticles = $this->saveArticles($articles, $source);
        
        // Cache results
        Cache::put($cacheKey, $savedArticles, now()->addMinutes(30));
        
        return $savedArticles;
    }

    /**
     * Scrape articles by category
     */
    private function scrapeByCategory(Category $category, bool $forceRefresh = false): array
    {
        $cacheKey = "category_articles_{$category->id}";
        
        if (!$forceRefresh && Cache::has($cacheKey)) {
            return Cache::get($cacheKey);
        }

        $articles = [];
        $sources = Source::where('is_active', true)->get();
        
        foreach ($sources as $source) {
            try {
                $sourceArticles = $this->scrapeFromSourceByCategory($source, $category);
                $articles = array_merge($articles, $sourceArticles);
            } catch (\Exception $e) {
                Log::error("Failed to scrape category from source", [
                    'category' => $category->name,
                    'source' => $source->name,
                    'error' => $e->getMessage()
                ]);
            }
        }
        
        // Cache results
        Cache::put($cacheKey, $articles, now()->addMinutes(30));
        
        return $articles;
    }

    /**
     * Scrape articles from source by category
     */
    private function scrapeFromSourceByCategory(Source $source, Category $category): array
    {
        $articles = [];
        
        switch ($source->api_name) {
            case 'newsapi':
                $articles = $this->newsAPIService->fetchTopHeadlines([
                    'category' => $category->slug,
                    'pageSize' => 50
                ]);
                break;
                
            case 'newsdata':
                $articles = $this->newsDataService->fetchLatestNews([$category->slug]);
                break;
                
            case 'nyt':
                $articles = $this->nyTimesService->fetchTopStories($category->slug);
                break;
        }
        
        return $this->saveArticles($articles, $source, $category);
    }

    /**
     * Scrape articles by search query
     */
    private function scrapeBySearchQuery(string $query, array $filters): array
    {
        $articles = [];
        $sources = Source::where('is_active', true)->get();
        
        foreach ($sources as $source) {
            try {
                $sourceArticles = $this->scrapeFromSourceBySearch($source, $query, $filters);
                $articles = array_merge($articles, $sourceArticles);
            } catch (\Exception $e) {
                Log::error("Failed to scrape search from source", [
                    'query' => $query,
                    'source' => $source->name,
                    'error' => $e->getMessage()
                ]);
            }
        }
        
        return $this->saveArticles($articles, $source);
    }

    /**
     * Scrape articles from source by search query
     */
    private function scrapeFromSourceBySearch(Source $source, string $query, array $filters): array
    {
        $articles = [];
        
        switch ($source->api_name) {
            case 'newsapi':
                $articles = $this->newsAPIService->searchArticles($query, $filters);
                break;
                
            case 'newsdata':
                $articles = $this->newsDataService->searchArticles($query, $filters);
                break;
                
            case 'nyt':
                $articles = $this->nyTimesService->searchArticles($query, $filters);
                break;
        }
        
        return $articles;
    }

    /**
     * Save articles to database with duplicate prevention
     */
    private function saveArticles(array $articles, Source $source, ?Category $category = null): array
    {
        $savedArticles = [];
        $duplicates = 0;
        
        foreach ($articles as $articleData) {
            try {
                // Check for existing article by URL or external ID
                $existingArticle = Article::where('url', $articleData['url'])
                    ->orWhere('external_id', $articleData['external_id'])
                    ->first();
                
                if ($existingArticle) {
                    $duplicates++;
                    continue;
                }
                
                // Determine category if not provided
                if (!$category) {
                    $category = $this->determineCategory($articleData);
                }
                
                $article = Article::create([
                    'title' => Str::limit($articleData['title'], 255),
                    'description' => $articleData['description'],
                    'content' => $articleData['content'],
                    'url' => $articleData['url'],
                    'url_to_image' => $articleData['url_to_image'],
                    'published_at' => $articleData['published_at'] ?? Carbon::now(),
                    'author' => $articleData['author'],
                    'source_id' => $source->id,
                    'category_id' => $category?->id,
                    'language' => $articleData['metadata']['language'] ?? 'en',
                    'country' => $articleData['metadata']['country'] ?? null,
                    'external_id' => $articleData['external_id'],
                    'metadata' => $articleData['metadata'],
                ]);
                
                $savedArticles[] = $article;
                
            } catch (\Exception $e) {
                Log::error("Failed to save article", [
                    'title' => $articleData['title'] ?? 'Unknown',
                    'error' => $e->getMessage()
                ]);
            }
        }
        
        Log::info("Articles saved", [
            'source' => $source->name,
            'saved' => count($savedArticles),
            'duplicates' => $duplicates
        ]);
        
        return $savedArticles;
    }

    /**
     * Determine category from article data
     */
    private function determineCategory(array $articleData): ?Category
    {
        // Try to determine category from metadata
        if (isset($articleData['metadata']['category'])) {
            $category = Category::where('slug', $articleData['metadata']['category'])->first();
            if ($category) {
                return $category;
            }
        }
        
        // Try to determine from keywords or content analysis
        $keywords = $articleData['metadata']['keywords'] ?? [];
        if (!empty($keywords)) {
            foreach ($keywords as $keyword) {
                $category = Category::where('name', 'ILIKE', "%{$keyword}%")->first();
                if ($category) {
                    return $category;
                }
            }
        }
        
        return null;
    }

    /**
     * Check rate limiting
     */
    private function checkRateLimit(?int $userId): bool
    {
        $userKey = $userId ? "user_{$userId}" : 'anonymous';
        
        // Check minute rate limit
        $minuteKey = self::RATE_LIMIT_MINUTE_KEY . "_{$userKey}";
        $minuteCount = Cache::get($minuteKey, 0);
        
        if ($minuteCount >= self::MAX_REQUESTS_PER_MINUTE) {
            return false;
        }
        
        // Check hour rate limit
        $hourKey = self::RATE_LIMIT_HOUR_KEY . "_{$userKey}";
        $hourCount = Cache::get($hourKey, 0);
        
        if ($hourCount >= self::MAX_REQUESTS_PER_HOUR) {
            return false;
        }
        
        // Increment counters
        Cache::put($minuteKey, $minuteCount + 1, now()->addMinute());
        Cache::put($hourKey, $hourCount + 1, now()->addHour());
        
        return true;
    }

    /**
     * Sanitize and validate filters
     */
    private function sanitizeFilters(array $filters): array
    {
        $sanitized = [];
        
        // Limit date range
        if (isset($filters['from_date'])) {
            $fromDate = Carbon::parse($filters['from_date']);
            $maxFromDate = now()->subDays(self::MAX_DATE_RANGE_DAYS);
            
            if ($fromDate->lt($maxFromDate)) {
                $filters['from_date'] = $maxFromDate->format('Y-m-d');
            }
        }
        
        if (isset($filters['to_date'])) {
            $toDate = Carbon::parse($filters['to_date']);
            if ($toDate->gt(now())) {
                $filters['to_date'] = now()->format('Y-m-d');
            }
        }
        
        // Limit articles per request
        if (isset($filters['pageSize'])) {
            $filters['pageSize'] = min((int) $filters['pageSize'], self::MAX_ARTICLES_PER_REQUEST);
        }
        
        return $filters;
    }

    /**
     * Generate cache key for search results
     */
    private function generateSearchCacheKey(string $query, array $filters): string
    {
        return 'search_' . md5($query . json_encode($filters));
    }

    /**
     * Check if cache should be refreshed
     */
    private function shouldRefreshCache(array $cachedResults): bool
    {
        // Refresh if cache is older than 15 minutes
        return Cache::get('cache_timestamp_' . md5(json_encode($cachedResults)), 0) < now()->subMinutes(15)->timestamp;
    }

    /**
     * Find existing articles that match search criteria
     */
    private function findExistingArticles(string $searchTerm, array $filters): array
    {
        $query = Article::with(['source', 'category']);
        
        // Apply search query
        $query->where(function ($q) use ($searchTerm) {
            $q->where('title', 'ILIKE', "%{$searchTerm}%")
              ->orWhere('description', 'ILIKE', "%{$searchTerm}%")
              ->orWhere('content', 'ILIKE', "%{$searchTerm}%");
        });
        
        // Apply filters
        if (isset($filters['from_date'])) {
            $query->whereDate('published_at', '>=', $filters['from_date']);
        }
        
        if (isset($filters['to_date'])) {
            $query->whereDate('published_at', '<=', $filters['to_date']);
        }
        
        if (isset($filters['category'])) {
            $query->whereHas('category', function ($q) use ($filters) {
                $q->where('slug', $filters['category']);
            });
        }
        
        if (isset($filters['source'])) {
            $query->whereHas('source', function ($q) use ($filters) {
                $q->where('slug', $filters['source']);
            });
        }
        
        return $query->orderBy('published_at', 'desc')
                    ->limit(50)
                    ->get()
                    ->toArray();
    }

    /**
     * Merge and deduplicate articles
     */
    private function mergeAndDeduplicateArticles(array $existingArticles, array $newArticles): array
    {
        $merged = $existingArticles;
        $existingUrls = array_column($existingArticles, 'url');
        
        foreach ($newArticles as $newArticle) {
            if (!in_array($newArticle['url'], $existingUrls)) {
                $merged[] = $newArticle;
                $existingUrls[] = $newArticle['url'];
            }
        }
        
        // Sort by published date
        usort($merged, function ($a, $b) {
            return Carbon::parse($b['published_at'])->timestamp - Carbon::parse($a['published_at'])->timestamp;
        });
        
        return array_slice($merged, 0, 50); // Limit to 50 articles
    }
}
