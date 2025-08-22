<?php

namespace App\Services\NewsAPIs;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Carbon\Carbon;

class NewsAPIService
{
    private string $apiKey;
    private string $baseUrl = 'https://newsapi.org/v2';

    public function __construct()
    {
        $this->apiKey = config('services.newsapi.key', env('NEWSAPI_KEY'));
    }

    /**
     * Fetch articles from NewsAPI
     */
    public function fetchArticles(array $parameters = []): array
    {
        $defaultParams = [
            'apiKey' => $this->apiKey,
            'language' => 'en',
            'sortBy' => 'publishedAt',
            'pageSize' => 100,
            'page' => 1,
        ];

        $params = array_merge($defaultParams, $parameters);

        try {
            $response = Http::timeout(30)->get($this->baseUrl . '/everything', $params);

            if ($response->successful()) {
                $data = $response->json();
                return $this->formatArticles($data['articles'] ?? []);
            }

            Log::error('NewsAPI request failed', [
                'status' => $response->status(),
                'response' => $response->body()
            ]);

            return [];
        } catch (\Exception $e) {
            Log::error('NewsAPI service error', [
                'message' => $e->getMessage(),
                'params' => $params
            ]);

            return [];
        }
    }

    /**
     * Fetch top headlines from NewsAPI
     */
    public function fetchTopHeadlines(array $parameters = []): array
    {
        $defaultParams = [
            'apiKey' => $this->apiKey,
            'country' => 'us',
            'pageSize' => 100,
            'page' => 1,
        ];

        $params = array_merge($defaultParams, $parameters);

        try {
            $response = Http::timeout(30)->get($this->baseUrl . '/top-headlines', $params);

            if ($response->successful()) {
                $data = $response->json();
                return $this->formatArticles($data['articles'] ?? []);
            }

            Log::error('NewsAPI top headlines request failed', [
                'status' => $response->status(),
                'response' => $response->body()
            ]);

            return [];
        } catch (\Exception $e) {
            Log::error('NewsAPI top headlines service error', [
                'message' => $e->getMessage(),
                'params' => $params
            ]);

            return [];
        }
    }

    /**
     * Get available sources from NewsAPI
     */
    public function fetchSources(): array
    {
        try {
            $response = Http::timeout(30)->get($this->baseUrl . '/sources', [
                'apiKey' => $this->apiKey,
            ]);

            if ($response->successful()) {
                $data = $response->json();
                return $data['sources'] ?? [];
            }

            return [];
        } catch (\Exception $e) {
            Log::error('NewsAPI sources fetch error', [
                'message' => $e->getMessage()
            ]);

            return [];
        }
    }

    /**
     * Search articles with specific query
     */
    public function searchArticles(string $query, array $parameters = []): array
    {
        $defaultParams = [
            'apiKey' => $this->apiKey,
            'q' => $query,
            'language' => 'en',
            'sortBy' => 'publishedAt',
            'pageSize' => 100,
            'page' => 1,
        ];

        $params = array_merge($defaultParams, $parameters);

        return $this->fetchArticles($params);
    }

    /**
     * Format articles to standardized structure
     */
    private function formatArticles(array $articles): array
    {
        return array_map(function ($article) {
            return [
                'title' => $article['title'] ?? '',
                'description' => $article['description'] ?? '',
                'content' => $article['content'] ?? '',
                'url' => $article['url'] ?? '',
                'url_to_image' => $article['urlToImage'] ?? null,
                'published_at' => $article['publishedAt'] ? Carbon::parse($article['publishedAt']) : null,
                'author' => $article['author'] ?? null,
                'source_name' => $article['source']['name'] ?? 'NewsAPI',
                'external_id' => $article['url'], // Use URL as external ID for NewsAPI
                'api_name' => 'newsapi',
                'metadata' => [
                    'source_id' => $article['source']['id'] ?? null,
                    'original_data' => $article
                ]
            ];
        }, $articles);
    }
}
