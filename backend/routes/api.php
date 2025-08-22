<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\ArticleController;
use App\Http\Controllers\Api\CategoryController;
use App\Http\Controllers\Api\SourceController;
use App\Http\Controllers\Api\UserPreferenceController;
use App\Http\Controllers\Api\QueueController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "api" middleware group. Make something great!
|
*/

// Authentication Routes
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);



// Protected Routes - All endpoints require authentication
Route::middleware('auth:sanctum')->group(function () {
    // User routes
    Route::get('/user', [AuthController::class, 'user']);
    Route::post('/logout', [AuthController::class, 'logout']);
    
    // User preferences routes
    Route::get('/preferences', [UserPreferenceController::class, 'show']);
    Route::post('/preferences', [UserPreferenceController::class, 'update']);
    Route::get('/personalized-feed', [UserPreferenceController::class, 'personalizedFeed']);
    
    // Articles routes
    Route::get('/articles', [ArticleController::class, 'index']);
    Route::get('/articles/filtered', [ArticleController::class, 'filteredArticles']);
    Route::post('/articles/initiate-scraping', [ArticleController::class, 'initiateScraping']);
    Route::get('/articles/search', [ArticleController::class, 'search']);
    Route::get('/articles/{id}', [ArticleController::class, 'show']);
    
    // Categories and sources routes
    Route::get('/categories', [CategoryController::class, 'index']);
    Route::get('/sources', [SourceController::class, 'index']);
    
    // Queue management routes
    Route::get('/queue/jobs', [QueueController::class, 'getJobs']);
    Route::get('/queue/jobs/{jobId}', [QueueController::class, 'getJobStatus']);
    Route::delete('/queue/jobs/{jobId}', [QueueController::class, 'cancelJob']);
    Route::post('/queue/sync-status', [QueueController::class, 'syncQueueStatus']);
    Route::post('/queue/jobs/{jobId}/retry', [QueueController::class, 'retryJob']);
});
