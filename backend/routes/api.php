<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\ArticleController;
use App\Http\Controllers\Api\CategoryController;
use App\Http\Controllers\Api\SourceController;
use App\Http\Controllers\Api\UserPreferenceController;

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

// Protected Routes
Route::middleware('auth:sanctum')->group(function () {
    // User routes
    Route::get('/user', [AuthController::class, 'user']);
    Route::post('/logout', [AuthController::class, 'logout']);
    
    // User preferences routes
    Route::get('/preferences', [UserPreferenceController::class, 'show']);
    Route::post('/preferences', [UserPreferenceController::class, 'update']);
    Route::get('/personalized-feed', [UserPreferenceController::class, 'personalizedFeed']);
});

// Public Routes
Route::get('/articles', [ArticleController::class, 'index']);
Route::get('/articles/search', [ArticleController::class, 'search']);
Route::get('/articles/{id}', [ArticleController::class, 'show']);

Route::get('/categories', [CategoryController::class, 'index']);
Route::get('/sources', [SourceController::class, 'index']);
