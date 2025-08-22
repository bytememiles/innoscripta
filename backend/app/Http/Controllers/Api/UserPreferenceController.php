<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\UserPreference;
use App\Models\Article;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Log;

/**
 * @group User Preferences
 * 
 * APIs for managing user preferences and personalized feeds
 */
class UserPreferenceController extends Controller
{
    /**
     * Get user preferences
     * 
     * Retrieve the current user's preferences for categories, sources, and authors.
     * 
     * @authenticated
     * 
     * @response 200 {
     *   "success": true,
     *   "data": {
     *     "preferences": {
     *       "id": 1,
     *       "user_id": 1,
     *       "preferred_categories": ["technology", "business"],
     *       "preferred_sources": ["newsapi", "nyt"],
     *       "preferred_authors": ["John Smith", "Jane Doe"],
     *       "created_at": "2024-01-15T10:30:00.000000Z",
     *       "updated_at": "2024-01-15T10:30:00.000000Z"
     *     }
     *   }
     * }
     * 
     * @response 200 {
     *   "success": true,
     *   "data": {
     *     "preferences": {
     *       "user_id": 1,
     *       "preferred_categories": [],
     *       "preferred_sources": [],
     *       "preferred_authors": [],
     *       "email_notifications": false,
     *       "timezone": "UTC"
     *     }
     *   },
     *   "message": "No preferences found. Please set your preferences first."
     * }
     */
    public function show(Request $request): JsonResponse
    {
        $preferences = UserPreference::where('user_id', $request->user()->id)->first();

        if (!$preferences) {
            // Return empty preferences instead of 404 for better UX
            return response()->json([
                'success' => true,
                'data' => [
                    'preferences' => [
                        'user_id' => $request->user()->id,
                        'preferred_categories' => [],
                        'preferred_sources' => [],
                        'preferred_authors' => [],
                        'email_notifications' => false,
                        'timezone' => 'UTC'
                    ]
                ],
                'message' => 'No preferences found. Please set your preferences first.'
            ]);
        }

        return response()->json([
            'success' => true,
            'data' => [
                'preferences' => $preferences
            ]
        ]);
    }

    /**
     * Update user preferences
     * 
     * Create or update the current user's preferences for personalized content.
     * 
     * @authenticated
     * 
     * @bodyParam preferred_categories array Array of category slugs. Example: ["technology", "business"]
     * @bodyParam preferred_sources array Array of source slugs. Example: ["newsapi", "nyt"]
     * @bodyParam preferred_authors array Array of author names. Example: ["John Smith", "Jane Doe"]
     * 
     * @response 200 {
     *   "success": true,
     *   "message": "Preferences updated successfully",
     *   "data": {
     *     "preferences": {
     *       "id": 1,
     *       "user_id": 1,
     *       "preferred_categories": ["technology", "business"],
     *       "preferred_sources": ["newsapi", "nyt"],
     *       "preferred_authors": ["John Smith", "Jane Doe"],
     *       "created_at": "2024-01-15T10:30:00.000000Z",
     *       "updated_at": "2024-01-15T10:31:00.000000Z"
     *     }
     *   }
     * }
     * 
     * @response 422 {
     *   "success": false,
     *   "message": "Validation error",
     *   "errors": {
     *     "preferred_categories": ["The preferred categories must be an array."],
     *     "preferred_categories.0": ["The selected preferred categories.0 is invalid."]
     *   }
     * }
     */
    public function update(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'preferred_categories' => 'nullable|array',
            'preferred_categories.*' => 'string|exists:categories,slug',
            'preferred_sources' => 'nullable|array',
            'preferred_sources.*' => 'string',
            'preferred_authors' => 'nullable|array',
            'preferred_authors.*' => 'string|max:255',
            'email_notifications' => 'nullable|boolean',
            'timezone' => 'nullable|string|max:100',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation error',
                'errors' => $validator->errors()
            ], 422);
        }

        // Custom validation for sources - check if they exist by slug or api_name
        if ($request->has('preferred_sources') && is_array($request->preferred_sources)) {
            $validSources = [];
            $invalidSources = [];
            
            foreach ($request->preferred_sources as $sourceIdentifier) {
                $source = \App\Models\Source::where('slug', $sourceIdentifier)
                    ->orWhere('api_name', $sourceIdentifier)
                    ->first();
                
                if ($source) {
                    $validSources[] = $source->slug; // Always store the slug
                } else {
                    $invalidSources[] = $sourceIdentifier;
                }
            }
            
            if (!empty($invalidSources)) {
                return response()->json([
                    'success' => false,
                    'message' => 'Some source identifiers are invalid',
                    'errors' => [
                        'preferred_sources' => ['The following sources are invalid: ' . implode(', ', $invalidSources)]
                    ]
                ], 422);
            }
            
            // Replace the request with validated slug values
            $request->merge(['preferred_sources' => $validSources]);
        }

        $preferences = UserPreference::updateOrCreate(
            ['user_id' => $request->user()->id],
            [
                'preferred_categories' => $request->get('preferred_categories', []),
                'preferred_sources' => $request->get('preferred_sources', []),
                'preferred_authors' => $request->get('preferred_authors', []),
                'email_notifications' => $request->get('email_notifications', false),
                'timezone' => $request->get('timezone', 'UTC'),
            ]
        );

        return response()->json([
            'success' => true,
            'message' => 'Preferences updated successfully',
            'data' => [
                'preferences' => $preferences
            ]
        ]);
    }

    /**
     * Get personalized news feed for home page
     * 
     * Retrieve a personalized news feed based on user preferences for the home page.
     * This endpoint is designed specifically for home page personalization.
     * If no articles exist, automatically scrapes news based on preferences.
     * 
     * @authenticated
     * 
     * @queryParam page integer Page number for pagination. Example: 1
     * @queryParam per_page integer Number of articles per page (max 50). Example: 10
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
     *     "first_page_url": "http://localhost:8000/api/personalized-feed?page=1",
     *     "from": 1,
     *     "last_page": 10,
     *     "last_page_url": "http://localhost:8000/api/personalized-feed?page=10",
     *     "links": [],
     *     "next_page_url": "http://localhost:8000/api/personalized-feed?page=2",
     *     "prev_page_url": null,
     *     "to": 10,
     *     "total": 100
     *   },
     *   "preferences_applied": {
     *     "categories": ["technology", "science"],
     *     "sources": ["newsapi", "nyt"],
     *     "authors": ["John Doe"]
     *   }
     * }
     */
    public function personalizedFeed(Request $request): JsonResponse
    {
        try {
            $validator = Validator::make($request->all(), [
                'page' => 'integer|min:1',
                'per_page' => 'integer|min:1|max:50',
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

            $preferences = UserPreference::where('user_id', $request->user()->id)->first();

            if (!$preferences) {
                // If no preferences exist, return general articles instead of 404
                $query = Article::with(['source', 'category']);
                
                // Apply date filters
                if ($request->filled('from_date')) {
                    $query->whereDate('published_at', '>=', $request->from_date);
                }

                if ($request->filled('to_date')) {
                    $query->whereDate('published_at', '<=', $request->to_date);
                }

                $perPage = $request->get('per_page', 10);
                $articles = $query->orderBy('published_at', 'desc')->paginate($perPage);

                // If no articles exist, trigger default scraping
                if ($articles->total() === 0 && $request->get('page', 1) == 1) {
                    $this->triggerDefaultScraping();
                    
                    return response()->json([
                        'success' => true,
                        'data' => $articles,
                        'message' => 'No preferences found. No articles available. Scraping default news in the background. Please try again in a few moments.',
                        'scraping_initiated' => true,
                        'preferences_applied' => null
                    ]);
                }

                return response()->json([
                    'success' => true,
                    'data' => $articles,
                    'message' => 'No preferences found. Showing general articles. Set your preferences for a personalized feed.',
                    'preferences_applied' => null
                ]);
            }

            $query = Article::with(['source', 'category']);

            // Apply preferences filters
            $hasPreferences = false;
            $appliedPreferences = [];

            if (!empty($preferences->preferred_categories)) {
                $query->whereHas('category', function ($q) use ($preferences) {
                    $q->whereIn('slug', $preferences->preferred_categories);
                });
                $hasPreferences = true;
                $appliedPreferences['categories'] = $preferences->preferred_categories;
            }

            if (!empty($preferences->preferred_sources)) {
                // Filter by source slug (now properly set in the sources table)
                $query->whereHas('source', function ($q) use ($preferences) {
                    $q->whereIn('slug', $preferences->preferred_sources);
                });
                $hasPreferences = true;
                $appliedPreferences['sources'] = $preferences->preferred_sources;
            }

            if (!empty($preferences->preferred_authors)) {
                $query->whereIn('author', $preferences->preferred_authors);
                $hasPreferences = true;
                $appliedPreferences['authors'] = $preferences->preferred_authors;
            }

            // If no preferences are set, return general articles
            if (!$hasPreferences) {
                $query = Article::with(['source', 'category']);
            }

            // Apply date filters
            if ($request->filled('from_date')) {
                $query->whereDate('published_at', '>=', $request->from_date);
            }

            if ($request->filled('to_date')) {
                $query->whereDate('published_at', '<=', $request->to_date);
            }

            $perPage = $request->get('per_page', 10);
            
            // Get the filtered articles
            $articles = $query->orderBy('published_at', 'desc')->paginate($perPage);
            
            // If no articles found with strict filtering, try a broader approach
            if ($articles->total() === 0 && $hasPreferences) {
                // Fallback: get articles from preferred categories without strict source filtering
                $fallbackQuery = Article::with(['source', 'category']);
                
                if (!empty($preferences->preferred_categories)) {
                    $fallbackQuery->whereHas('category', function ($q) use ($preferences) {
                        $q->whereIn('slug', $preferences->preferred_categories);
                    });
                }
                
                $articles = $fallbackQuery->orderBy('published_at', 'desc')->paginate($perPage);
            }

            // If still no articles found and this is the first page, trigger scraping
            if ($articles->total() === 0 && $request->get('page', 1) == 1) {
                $this->triggerPreferenceBasedScraping($preferences);
                
                return response()->json([
                    'success' => true,
                    'data' => $articles,
                    'message' => 'No articles found for your preferences. Scraping news in the background. Please try again in a few moments.',
                    'scraping_initiated' => true,
                    'preferences_applied' => $appliedPreferences
                ]);
            }

            return response()->json([
                'success' => true,
                'data' => $articles,
                'preferences_applied' => $appliedPreferences
            ]);

        } catch (\Exception $e) {
            Log::error('Personalized feed error', [
                'message' => $e->getMessage(),
                'file' => $e->getFile(),
                'line' => $e->getLine(),
                'trace' => $e->getTraceAsString(),
                'request' => $request->all(),
                'user_id' => $request->user()?->id
            ]);

            return response()->json([
                'success' => false,
                'message' => 'An error occurred while fetching your personalized feed. Please try again later.',
                'error' => config('app.debug') ? $e->getMessage() : 'Internal server error'
            ], 500);
        }
    }

    /**
     * Trigger default news scraping
     */
    private function triggerDefaultScraping(): void
    {
        \App\Jobs\ScrapeNewsJob::dispatch('default');
    }

    /**
     * Trigger preference-based news scraping
     */
    private function triggerPreferenceBasedScraping(UserPreference $preferences): void
    {
        \App\Jobs\ScrapeNewsJob::dispatch('user_preferences', [], $preferences->user_id);
    }
}
