<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Article;
use App\Services\NewsScrapingService;
use App\Jobs\ScrapeNewsJob;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Str;

/**
 * @group Articles
 * 
 * APIs for managing and retrieving news articles
 */
class ArticleController extends Controller
{
    private NewsScrapingService $scrapingService;

    public function __construct(NewsScrapingService $scrapingService)
    {
        $this->scrapingService = $scrapingService;
    }

    /**
     * List articles
     * 
     * Retrieve a paginated list of articles with optional filtering.
     * If no articles exist, automatically scrapes news based on user preferences or defaults.
     * 
     * @queryParam page integer Page number for pagination. Example: 1
     * @queryParam per_page integer Number of articles per page (max 50). Example: 10
     * @queryParam category string Filter by category slug. Example: technology
     * @queryParam source string Filter by source slug. Example: newsapi
     * @queryParam from_date string Filter articles from this date (Y-m-d format). Example: 2024-01-01
     * @queryParam to_date string Filter articles to this date (Y-m-d format). Example: 2024-01-31
     * @queryParam keyword string Search articles by keyword in title or description. Example: AI
     * 
     * @response 200 {
     *   "success": true,
     *   "data": {
     *     "current_page": 1,
     *     "data": [
     *       {
     *         "id": 1,
     *         "title": "Breaking News: AI Revolution",
     *         "description": "Latest developments in artificial intelligence...",
     *         "content": "Full article content here...",
     *         "url": "https://example.com/article/1",
     *         "url_to_image": "https://example.com/image.jpg",
     *         "published_at": "2024-01-15T10:30:00.000000Z",
     *         "source": {
     *           "id": 1,
     *           "name": "NewsAPI",
     *           "slug": "newsapi"
     *         },
     *         "category": {
     *           "id": 1,
     *           "name": "Technology",
     *           "slug": "technology"
     *         },
     *         "created_at": "2024-01-15T10:30:00.000000Z",
     *         "updated_at": "2024-01-15T10:30:00.000000Z"
     *       }
     *     ],
     *     "first_page_url": "http://localhost:8000/api/articles?page=1",
     *     "from": 1,
     *     "last_page": 10,
     *     "last_page_url": "http://localhost:8000/api/articles?page=10",
     *     "links": [],
     *     "next_page_url": "http://localhost:8000/api/articles?page=2",
     *     "prev_page_url": null,
     *     "to": 10,
     *     "total": 100
     *   }
     * }
     * 
     * @response 422 {
     *   "success": false,
     *   "message": "Validation error",
     *   "errors": {
     *     "per_page": ["The per page must not be greater than 50."],
     *     "from_date": ["The from date does not match the format Y-m-d."]
     *   }
     * }
     */
    public function index(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'page' => 'integer|min:1',
            'per_page' => 'integer|min:1|max:50',
            'category' => 'string|exists:categories,slug',
            'source' => 'string|exists:sources,slug',
            'from_date' => 'date_format:Y-m-d',
            'to_date' => 'date_format:Y-m-d|after_or_equal:from_date',
            'keyword' => 'string|max:255',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation error',
                'errors' => $validator->errors()
            ], 422);
        }

        $query = Article::with(['source', 'category']);

        // Apply filters
        if ($request->filled('category')) {
            $query->whereHas('category', function ($q) use ($request) {
                $q->where('slug', $request->category);
            });
        }

        if ($request->filled('source')) {
            $query->whereHas('source', function ($q) use ($request) {
                $q->where('slug', $request->source);
            });
        }

        if ($request->filled('from_date')) {
            $query->whereDate('published_at', '>=', $request->from_date);
        }

        if ($request->filled('to_date')) {
            $query->whereDate('published_at', '<=', $request->to_date);
        }

        if ($request->filled('keyword')) {
            $keyword = $request->keyword;
            $query->where(function ($q) use ($keyword) {
                $q->where('title', 'ILIKE', "%{$keyword}%")
                  ->orWhere('description', 'ILIKE', "%{$keyword}%");
            });
        }

        $perPage = $request->get('per_page', 10);
        $articles = $query->orderBy('published_at', 'desc')->paginate($perPage);

        // If no articles found and this is the first page, trigger scraping
        if ($articles->total() === 0 && $request->get('page', 1) == 1) {
            $this->triggerInitialScraping($request);
            
            return response()->json([
                'success' => true,
                'data' => $articles,
                'message' => 'No articles found. Scraping news in the background. Please try again in a few moments.',
                'scraping_initiated' => true
            ]);
        }

        return response()->json([
            'success' => true,
            'data' => $articles
        ]);
    }

    /**
     * Get article details
     * 
     * Retrieve a specific article by its ID.
     * 
     * @urlParam id string required The article UUID. Example: 550e8400-e29b-41d4-a716-446655440000
     * 
     * @response 200 {
     *   "success": true,
     *   "data": {
     *     "article": {
     *       "id": "550e8400-e29b-41d4-a716-446655440000",
     *       "title": "Breaking News: AI Revolution",
     *       "description": "Latest developments in artificial intelligence...",
     *       "content": "Full article content here...",
     *       "url": "https://example.com/article/1",
     *       "url_to_image": "https://example.com/image.jpg",
     *       "published_at": "2024-01-15T10:30:00.000000Z",
     *       "source": {
     *         "id": "550e8400-e29b-41d4-a716-446655440001",
     *         "name": "NewsAPI",
     *         "slug": "newsapi"
     *       },
     *       "category": {
     *         "id": "550e8400-e29b-41d4-a716-446655440002",
     *         "name": "Technology",
     *         "slug": "technology"
     *       },
     *       "created_at": "2024-01-15T10:30:00.000000Z",
     *       "updated_at": "2024-01-15T10:30:00.000000Z"
     *     }
     *   }
     * }
     * 
     * @response 404 {
     *   "success": false,
     *   "message": "Article not found"
     * }
     */
    public function show(string $id): JsonResponse
    {
        $article = Article::with(['source', 'category'])->find($id);

        if (!$article) {
            return response()->json([
                'success' => false,
                'message' => 'Article not found'
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => [
                'article' => $article
            ]
        ]);
    }

    /**
     * Search articles
     * 
     * Full-text search across article title, description, and content.
     * Automatically scrapes new articles if needed and merges with existing results.
     * 
     * @queryParam q string required The search query. Example: artificial intelligence
     * @queryParam page integer Page number for pagination. Example: 1
     * @queryParam per_page integer Number of articles per page (max 50). Example: 10
     * @queryParam category string Filter by category slug. Example: technology
     * @queryParam source string Filter by source slug. Example: newsapi
     * @queryParam from_date string Filter articles from this date (Y-m-d format). Example: 2024-01-01
     * @queryParam to_date string Filter articles to this date (Y-m-d format). Example: 2024-01-31
     * 
     * @response 200 {
     *   "success": true,
     *   "data": {
     *     "current_page": 1,
     *     "data": [
     *       {
     *         "id": 1,
     *         "title": "Breaking News: AI Revolution",
     *         "description": "Latest developments in artificial intelligence...",
     *         "content": "Full article content here...",
     *         "url": "https://example.com/article/1",
     *         "url_to_image": "https://example.com/image.jpg",
     *         "published_at": "2024-01-15T10:30:00.000000Z",
     *         "source": {
     *           "id": 1,
     *           "name": "NewsAPI",
     *           "slug": "newsapi"
     *         },
     *         "category": {
     *           "id": 1,
     *           "name": "Technology",
     *           "slug": "technology"
     *         },
     *         "created_at": "2024-01-15T10:30:00.000000Z",
     *         "updated_at": "2024-01-15T10:30:00.000000Z"
     *       }
     *     ],
     *     "first_page_url": "http://localhost:8000/api/articles/search?q=ai&page=1",
     *     "from": 1,
     *     "last_page": 5,
     *     "last_page_url": "http://localhost:8000/api/articles/search?q=ai&page=5",
     *     "links": [],
     *     "next_page_url": "http://localhost:8000/api/articles?page=2",
     *     "prev_page_url": null,
     *     "to": 10,
     *     "total": 50
     *   }
     * }
     * 
     * @response 422 {
     *   "success": false,
     *   "message": "Validation error",
     *   "errors": {
     *     "q": ["The q field is required."]
     *   }
     * }
     */
    public function search(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'q' => 'required|string|min:1|max:255',
            'page' => 'integer|min:1',
            'per_page' => 'integer|min:1|max:50',
            'category' => 'string|exists:categories,slug',
            'source' => 'string|exists:sources,slug',
            'from_date' => 'date_format:Y-m-d',
            'to_date' => 'date_format:Y-m-d|after_or_equal:from_date',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation error',
                'errors' => $validator->errors()
            ], 422);
        }

        $searchTerm = $request->q;
        $filters = $request->only(['category', 'source', 'from_date', 'to_date']);
        
        // Check cache first
        $cacheKey = "search_cache_" . md5($searchTerm . json_encode($filters));
        $cachedResults = Cache::get($cacheKey);
        
        if ($cachedResults && !$this->shouldRefreshCache($cachedResults)) {
            return response()->json([
                'success' => true,
                'data' => $cachedResults,
                'from_cache' => true
            ]);
        }

        try {
            // Use the scraping service to get fresh results
            $userId = $request->user()?->id;
            $scrapedArticles = $this->scrapingService->scrapeForSearch($searchTerm, $filters, $userId);
            
            // Get existing articles that match the search
            $query = Article::with(['source', 'category']);
            
            // Apply search query
            $query->where(function ($q) use ($searchTerm) {
                $q->where('title', 'ILIKE', "%{$searchTerm}%")
                  ->orWhere('description', 'ILIKE', "%{$searchTerm}%")
                  ->orWhere('content', 'ILIKE', "%{$searchTerm}%");
            });

            // Apply filters
            if ($request->filled('category')) {
                $query->whereHas('category', function ($q) use ($request) {
                    $q->where('slug', $request->category);
                });
            }

            if ($request->filled('source')) {
                $query->whereHas('source', function ($q) use ($request) {
                    $q->where('slug', $request->source);
                });
            }

            if ($request->filled('from_date')) {
                $query->whereDate('published_at', '>=', $request->from_date);
            }

            if ($request->filled('to_date')) {
                $query->whereDate('published_at', '<=', $request->to_date);
            }

            $perPage = $request->get('per_page', 10);
            $articles = $query->orderBy('published_at', 'desc')->paginate($perPage);
            
            // Cache the results
            Cache::put($cacheKey, $articles, now()->addMinutes(15));
            
            return response()->json([
                'success' => true,
                'data' => $articles,
                'scraped_new_articles' => count($scrapedArticles)
            ]);
            
        } catch (\Exception $e) {
            // Fallback to database search only
            $query = Article::with(['source', 'category']);
            
            // Apply search query
            $query->where(function ($q) use ($searchTerm) {
                $q->where('title', 'ILIKE', "%{$searchTerm}%")
                  ->orWhere('description', 'ILIKE', "%{$searchTerm}%")
                  ->orWhere('content', 'ILIKE', "%{$searchTerm}%");
            });

            // Apply filters
            if ($request->filled('category')) {
                $query->whereHas('category', function ($q) use ($request) {
                    $q->where('slug', $request->category);
                });
            }

            if ($request->filled('source')) {
                $query->whereHas('source', function ($q) use ($request) {
                    $q->where('slug', $request->source);
                });
            }

            if ($request->filled('from_date')) {
                $query->whereDate('published_at', '>=', $request->from_date);
            }

            if ($request->filled('to_date')) {
                $query->whereDate('published_at', '<=', $request->to_date);
            }

            $perPage = $request->get('per_page', 10);
            $articles = $query->orderBy('published_at', 'desc')->paginate($perPage);

            return response()->json([
                'success' => true,
                'data' => $articles,
                'message' => 'Search completed with existing articles. Some features may be limited.',
                'error' => $e->getMessage()
            ]);
        }
    }

    /**
     * Get filtered articles for search page
     * 
     * Retrieve articles with comprehensive filtering options for the search page.
     * This endpoint is designed specifically for search functionality with filters.
     * 
     * @queryParam page integer Page number for pagination. Example: 1
     * @queryParam per_page integer Number of articles per page (max 50). Example: 10
     * @queryParam keyword string Search keyword in title, description, and content. Example: artificial intelligence
     * @queryParam category string Filter by category slug. Example: technology
     * @queryParam source string Filter by source slug. Example: newsapi
     * @queryParam from_date string Filter articles from this date (Y-m-d format). Example: 2024-01-01
     * @queryParam to_date string Filter articles to this date (Y-m-d format). Example: 2024-01-31
     * @queryParam sort_by string Sort order (published_at, title, relevance). Example: published_at
     * @queryParam sort_order string Sort direction (asc, desc). Example: desc
     * 
     * @response 200 {
     *   "success": true,
     *   "data": {
     *     "current_page": 1,
     *     "data": [
     *       {
     *         "id": 1,
     *         "title": "Breaking News: AI Revolution",
     *         "description": "Latest developments in artificial intelligence...",
     *         "content": "Full article content here...",
     *         "url": "https://example.com/article/1",
     *         "url_to_image": "https://example.com/image.jpg",
     *         "published_at": "2024-01-15T10:30:00.000000Z",
     *         "source": {
     *           "id": 1,
     *           "name": "NewsAPI",
     *           "slug": "newsapi"
     *         },
     *         "category": {
     *           "id": 1,
     *           "name": "Technology",
     *           "slug": "technology"
     *         },
     *         "created_at": "2024-01-15T10:30:00.000000Z",
     *         "updated_at": "2024-01-15T10:30:00.000000Z"
     *       }
     *     ],
     *     "first_page_url": "http://localhost:8000/api/articles/filtered?page=1",
     *     "from": 1,
     *     "last_page": 10,
     *     "last_page_url": "http://localhost:8000/api/articles/filtered?page=10",
     *     "links": [],
     *     "next_page_url": "http://localhost:8000/api/articles/filtered?page=2",
     *     "prev_page_url": null,
     *     "to": 10,
     *     "total": 100
     *   },
     *   "filters_applied": {
     *     "keyword": "artificial intelligence",
     *     "category": "technology",
     *     "source": "newsapi",
     *     "from_date": "2024-01-01",
     *     "to_date": "2024-01-31",
     *     "sort_by": "published_at",
     *     "sort_order": "desc"
     *   }
     * }
     */
    public function filteredArticles(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'page' => 'integer|min:1',
            'per_page' => 'integer|min:1|max:50',
            'keyword' => 'string|max:255',
            'category' => 'string|exists:categories,slug',
            'source' => 'string|exists:sources,slug',
            'from_date' => 'date_format:Y-m-d',
            'to_date' => 'date_format:Y-m-d|after_or_equal:from_date',
            'sort_by' => 'string|in:published_at,title,relevance',
            'sort_order' => 'string|in:asc,desc',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation error',
                'errors' => $validator->errors()
            ], 422);
        }

        $query = Article::with(['source', 'category']);

        // Apply keyword search
        if ($request->filled('keyword')) {
            $keyword = $request->keyword;
            $query->where(function ($q) use ($keyword) {
                $q->where('title', 'ILIKE', "%{$keyword}%")
                  ->orWhere('description', 'ILIKE', "%{$keyword}%")
                  ->orWhere('content', 'ILIKE', "%{$keyword}%");
            });
        }

        // Apply category filter
        if ($request->filled('category')) {
            $query->whereHas('category', function ($q) use ($request) {
                $q->where('slug', $request->category);
            });
        }

        // Apply source filter
        if ($request->filled('source')) {
            $query->whereHas('source', function ($q) use ($request) {
                $q->where('slug', $request->source);
            });
        }

        // Apply date filters
        if ($request->filled('from_date')) {
            $query->whereDate('published_at', '>=', $request->from_date);
        }

        if ($request->filled('to_date')) {
            $query->whereDate('published_at', '<=', $request->to_date);
        }

        // Apply sorting
        $sortBy = $request->get('sort_by', 'published_at');
        $sortOrder = $request->get('sort_order', 'desc');

        if ($sortBy === 'relevance' && $request->filled('keyword')) {
            // Relevance sorting based on keyword matches
            $keyword = $request->keyword;
            $query->orderByRaw("
                CASE 
                    WHEN title ILIKE '%{$keyword}%' THEN 1
                    WHEN description ILIKE '%{$keyword}%' THEN 2
                    WHEN content ILIKE '%{$keyword}%' THEN 3
                    ELSE 4
                END
            ")->orderBy('published_at', 'desc');
        } elseif ($sortBy === 'relevance' && !$request->filled('keyword')) {
            // If relevance is requested but no keyword, fall back to published_at
            $query->orderBy('published_at', 'desc');
        } else {
            // Validate sort_by field exists in articles table
            $allowedSortFields = ['published_at', 'title', 'created_at', 'updated_at'];
            if (!in_array($sortBy, $allowedSortFields)) {
                $sortBy = 'published_at'; // Default fallback
            }
            $query->orderBy($sortBy, $sortOrder);
        }

        $perPage = $request->get('per_page', 10);
        $articles = $query->paginate($perPage);

        // If no articles found and this is the first page, suggest manual scraping
        if ($articles->total() === 0 && $request->get('page', 1) == 1) {
            return response()->json([
                'success' => true,
                'data' => $articles,
                'message' => 'No articles found with current filters. You can initiate news scraping to find relevant content.',
                'scraping_available' => true,
                'filters_applied' => $this->getAppliedFilters($request)
            ]);
        }

        return response()->json([
            'success' => true,
            'data' => $articles,
            'filters_applied' => $this->getAppliedFilters($request)
        ]);
    }

    /**
     * Get applied filters for response
     */
    private function getAppliedFilters(Request $request): array
    {
        return $request->only([
            'keyword', 'category', 'source', 'from_date', 'to_date', 'sort_by', 'sort_order'
        ]);
    }

    /**
     * Trigger filtered news scraping
     */
    private function triggerFilteredScraping(Request $request): void
    {
        $userId = $request->user()?->id;
        $filters = $request->only(['keyword', 'category', 'source', 'from_date', 'to_date']);
        
        // Generate unique job ID for tracking
        $jobId = Str::uuid()->toString();
        
        // Track the job in cache for monitoring
        $trackedJobs = Cache::get('tracked_jobs', []);
        $trackedJobs[$jobId] = [
            'type' => 'filtered_search',
            'status' => 'queued',
            'filters' => $filters,
            'created_at' => now()->toISOString(),
            'started_at' => null,
            'completed_at' => null,
            'failed_at' => null,
            'error_message' => null,
            'progress' => 0,
            'user_id' => $userId,
            'estimated_duration' => '2-5 minutes'
        ];
        Cache::put('tracked_jobs', $trackedJobs, now()->addHours(24)); // Cache for 24 hours
        
        // Dispatch scraping job for filtered search
        \App\Jobs\ScrapeNewsJob::dispatch('filtered_search', $filters, $userId, $jobId);
    }

    /**
     * Trigger initial scraping when no articles exist
     */
    private function triggerInitialScraping(Request $request): void
    {
        $userId = $request->user()?->id;
        
        if ($userId) {
            // Generate unique job ID for tracking
            $jobId = Str::uuid()->toString();
            
            // Track the job in cache for monitoring
            $trackedJobs = Cache::get('tracked_jobs', []);
            $trackedJobs[$jobId] = [
                'type' => 'user_preferences',
                'status' => 'queued',
                'filters' => [],
                'created_at' => now()->toISOString(),
                'started_at' => null,
                'completed_at' => null,
                'failed_at' => null,
                'error_message' => null,
                'progress' => 0,
                'user_id' => $userId,
                'estimated_duration' => '2-5 minutes'
            ];
            Cache::put('tracked_jobs', $trackedJobs, now()->addHours(24)); // Cache for 24 hours
            
            // Scrape based on user preferences
            ScrapeNewsJob::dispatch('user_preferences', [], $userId, $jobId);
        } else {
            // Generate unique job ID for tracking
            $jobId = Str::uuid()->toString();
            
            // Track the job in cache for monitoring
            $trackedJobs = Cache::get('tracked_jobs', []);
            $trackedJobs[$jobId] = [
                'type' => 'default',
                'status' => 'queued',
                'filters' => [],
                'created_at' => now()->toISOString(),
                'started_at' => null,
                'completed_at' => null,
                'failed_at' => null,
                'error_message' => null,
                'progress' => 0,
                'user_id' => null,
                'estimated_duration' => '2-5 minutes'
            ];
            Cache::put('tracked_jobs', $trackedJobs, now()->addHours(24)); // Cache for 24 hours
            
            // Scrape default news
            ScrapeNewsJob::dispatch('default', [], null, $jobId);
        }
    }

    /**
     * Check if cache should be refreshed
     */
    private function shouldRefreshCache($cachedResults): bool
    {
        // Refresh if cache is older than 15 minutes
        return Cache::get('cache_timestamp_' . md5(json_encode($cachedResults)), 0) < now()->subMinutes(15)->timestamp;
    }

    /**
     * Manually initiate news scraping based on filters
     * 
     * @queryParam keyword string Search keyword. Example: artificial intelligence
     * @queryParam category string Filter by category slug. Example: technology
     * @queryParam source string Filter by source slug. Example: newsapi
     * @queryParam from_date string Filter articles from this date (Y-m-d format). Example: 2024-01-01
     * @queryParam to_date string Filter articles to this date (Y-m-d format). Example: 2024-01-31
     * 
     * @response 200 {
     *   "success": true,
     *   "message": "News scraping job has been queued successfully",
     *   "job_id": "job-uuid-here",
     *   "estimated_duration": "2-5 minutes"
     * }
     */
    public function initiateScraping(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'keyword' => 'string|max:255',
            'category' => 'string|exists:categories,slug',
            'source' => 'string|exists:sources,slug',
            'from_date' => 'date_format:Y-m-d',
            'to_date' => 'date_format:Y-m-d|after_or_equal:from_date',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation error',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $userId = $request->user()?->id;
            $filters = $request->only(['keyword', 'category', 'source', 'from_date', 'to_date']);
            
            // Generate unique job ID for tracking
            $jobId = Str::uuid()->toString();
            
            // Track the job in cache for monitoring
            $trackedJobs = Cache::get('tracked_jobs', []);
            $trackedJobs[$jobId] = [
                'type' => 'filtered_search',
                'status' => 'queued',
                'filters' => $filters,
                'created_at' => now()->toISOString(),
                'started_at' => null,
                'completed_at' => null,
                'failed_at' => null,
                'error_message' => null,
                'progress' => 0,
                'user_id' => $userId,
                'estimated_duration' => '2-5 minutes'
            ];
            Cache::put('tracked_jobs', $trackedJobs, now()->addHours(24)); // Cache for 24 hours
            
            // Dispatch scraping job with the unique ID
            $job = \App\Jobs\ScrapeNewsJob::dispatch('filtered_search', $filters, $userId, $jobId);
            
            return response()->json([
                'success' => true,
                'data' => [
                    'success' => true,
                    'message' => 'News scraping job has been queued successfully',
                    'job_id' => $jobId,
                    'estimated_duration' => '2-5 minutes',
                    'filters_applied' => $filters
                ]
            ]);
            
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to initiate scraping job',
                'error' => config('app.debug') ? $e->getMessage() : 'Internal server error'
            ], 500);
        }
    }
}
