<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Category;
use Illuminate\Http\JsonResponse;

/**
 * @group Categories
 * 
 * APIs for retrieving article categories
 */
class CategoryController extends Controller
{
    /**
     * List all categories
     * 
     * Retrieve all available article categories.
     * 
     * @response 200 {
     *   "success": true,
     *   "data": {
     *     "categories": [
     *       {
     *         "id": 1,
     *         "name": "Technology",
     *         "slug": "technology",
     *         "description": "Latest technology news and updates",
     *         "created_at": "2024-01-15T10:30:00.000000Z",
     *         "updated_at": "2024-01-15T10:30:00.000000Z"
     *       },
     *       {
     *         "id": 2,
     *         "name": "Business",
     *         "slug": "business",
     *         "description": "Business and finance news",
     *         "created_at": "2024-01-15T10:30:00.000000Z",
     *         "updated_at": "2024-01-15T10:30:00.000000Z"
     *       }
     *     ]
     *   }
     * }
     */
    public function index(): JsonResponse
    {
        $categories = Category::orderBy('name')->get();

        return response()->json([
            'success' => true,
            'data' => [
                'categories' => $categories
            ]
        ]);
    }
}
