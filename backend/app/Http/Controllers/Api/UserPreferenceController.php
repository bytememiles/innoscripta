<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\UserPreference;
use App\Models\Article;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Validator;

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
     * @response 404 {
     *   "success": false,
     *   "message": "No preferences found. Please set your preferences first."
     * }
     */
    public function show(Request $request): JsonResponse
    {
        $preferences = UserPreference::where('user_id', $request->user()->id)->first();

        if (!$preferences) {
            return response()->json([
                'success' => false,
                'message' => 'No preferences found. Please set your preferences first.'
            ], 404);
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
            'preferred_sources.*' => 'string|exists:sources,slug',
            'preferred_authors' => 'nullable|array',
            'preferred_authors.*' => 'string|max:255',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation error',
                'errors' => $validator->errors()
            ], 422);
        }

        $preferences = UserPreference::updateOrCreate(
            ['user_id' => $request->user()->id],
            [
                'preferred_categories' => $request->get('preferred_categories', []),
                'preferred_sources' => $request->get('preferred_sources', []),
                'preferred_authors' => $request->get('preferred_authors', []),
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
     * Get personalized news feed
     * 
     * Retrieve a personalized news feed based on user preferences.
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
     *     "path": "http://localhost:8000/api/personalized-feed",
     *     "per_page": 10,
     *     "prev_page_url": null,
     *     "to": 10,
     *     "total": 100
     *   }
     * }
     * 
     * @response 404 {
     *   "success": false,
     *   "message": "No preferences found. Please set your preferences first to get a personalized feed."
     * }
     * 
     * @response 422 {
     *   "success": false,
     *   "message": "Validation error",
     *   "errors": {
     *     "per_page": ["The per page must not be greater than 50."]
     *   }
     * }
     */
    public function personalizedFeed(Request $request): JsonResponse
    {
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
            return response()->json([
                'success' => false,
                'message' => 'No preferences found. Please set your preferences first to get a personalized feed.'
            ], 404);
        }

        $query = Article::with(['source', 'category']);

        // Apply preferences filters
        $hasPreferences = false;

        if (!empty($preferences->preferred_categories)) {
            $query->whereHas('category', function ($q) use ($preferences) {
                $q->whereIn('slug', $preferences->preferred_categories);
            });
            $hasPreferences = true;
        }

        if (!empty($preferences->preferred_sources)) {
            $query->whereHas('source', function ($q) use ($preferences) {
                $q->whereIn('slug', $preferences->preferred_sources);
            });
            $hasPreferences = true;
        }

        if (!empty($preferences->preferred_authors)) {
            $query->whereIn('author', $preferences->preferred_authors);
            $hasPreferences = true;
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
        $articles = $query->orderBy('published_at', 'desc')->paginate($perPage);

        return response()->json([
            'success' => true,
            'data' => $articles
        ]);
    }
}
