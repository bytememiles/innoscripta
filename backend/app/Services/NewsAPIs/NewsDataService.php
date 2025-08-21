<?php

namespace App\Services\NewsAPIs;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Carbon\Carbon;

class NewsDataService
{
    private string $apiKey;
    private string $baseUrl = 'https://newsdata.io/api/1';

    public function __construct()
    {
        $this->apiKey = config('services.newsdata.key', env('NEWSDATA_API_KEY'));
    }

    /**
     * Fetch articles from NewsData.io
     */
    public function fetchArticles(array $parameters = []): array
    {
        $defaultParams = [
            'apikey' => $this->apiKey,
            'language' => 'en',
            'size' => 50, // NewsData.io max size is 50
        ];

        $params = array_merge($defaultParams, $parameters);

        try {
            $response = Http::timeout(30)->get($this->baseUrl . '/news', $params);

            if ($response->successful()) {
                $data = $response->json();
                return $this->formatArticles($data['results'] ?? []);
            }

            Log::error('NewsData.io request failed', [
                'status' => $response->status(),
                'response' => $response->body()
            ]);

            return [];
        } catch (\Exception $e) {
            Log::error('NewsData.io service error', [
                'message' => $e->getMessage(),
                'params' => $params
            ]);

            return [];
        }
    }

    /**
     * Fetch latest news with specific categories
     */
    public function fetchLatestNews(array $categories = []): array
    {
        $params = [
            'apikey' => $this->apiKey,
            'language' => 'en',
            'size' => 50,
        ];

        if (!empty($categories)) {
            $params['category'] = implode(',', $categories);
        }

        return $this->fetchArticles($params);
    }

    /**
     * Search articles with keyword
     */
    public function searchArticles(string $keyword, array $parameters = []): array
    {
        $defaultParams = [
            'apikey' => $this->apiKey,
            'q' => $keyword,
            'language' => 'en',
            'size' => 50,
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
                'content' => $article['content'] ?? $article['description'] ?? '',
                'url' => $article['link'] ?? '',
                'url_to_image' => $article['image_url'] ?? null,
                'published_at' => $article['pubDate'] ? Carbon::parse($article['pubDate']) : null,
                'author' => $article['creator'] ? (is_array($article['creator']) ? implode(', ', $article['creator']) : $article['creator']) : null,
                'source_name' => $article['source_id'] ?? 'NewsData.io',
                'external_id' => $article['article_id'] ?? $article['link'],
                'api_name' => 'newsdata',
                'metadata' => [
                    'article_id' => $article['article_id'] ?? null,
                    'source_id' => $article['source_id'] ?? null,
                    'country' => $article['country'] ?? null,
                    'category' => $article['category'] ?? null,
                    'keywords' => $article['keywords'] ?? null,
                    'original_data' => $article
                ]
            ];
        }, $articles);
    }
}
