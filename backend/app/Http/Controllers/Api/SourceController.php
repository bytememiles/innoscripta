<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Source;
use Illuminate\Http\JsonResponse;

/**
 * @group Sources
 * 
 * APIs for retrieving news sources
 */
class SourceController extends Controller
{
    /**
     * List all sources
     * 
     * Retrieve all available news sources.
     * 
     * @response 200 {
     *   "success": true,
     *   "data": {
     *     "sources": [
     *       {
     *         "id": "550e8400-e29b-41d4-a716-446655440001",
     *         "name": "NewsAPI",
     *         "slug": "newsapi",
     *         "description": "NewsAPI.org news aggregator",
     *         "url": "https://newsapi.org",
     *         "created_at": "2024-01-15T10:30:00.000000Z",
     *         "updated_at": "2024-01-15T10:30:00.000000Z"
     *       },
     *       {
     *         "id": "550e8400-e29b-41d4-a716-446655440002",
     *         "name": "NewsData.io",
     *         "slug": "newsdata",
     *         "description": "NewsData.io API service",
     *         "url": "https://newsdata.io",
     *         "created_at": "2024-01-15T10:30:00.000000Z",
     *         "updated_at": "2024-01-15T10:30:00.000000Z"
     *       },
     *       {
     *         "id": "550e8400-e29b-41d4-a716-446655440003",
     *         "name": "The New York Times",
     *         "slug": "nyt",
     *         "description": "The New York Times API",
     *         "url": "https://developer.nytimes.com",
     *         "created_at": "2024-01-15T10:30:00.000000Z",
     *         "updated_at": "2024-01-15T10:30:00.000000Z"
     *       }
     *     ]
     *   }
     * }
     */
    public function index(): JsonResponse
    {
        $sources = Source::orderBy('name')->get();

        return response()->json([
            'success' => true,
            'data' => [
                'sources' => $sources
            ]
        ]);
    }
}
