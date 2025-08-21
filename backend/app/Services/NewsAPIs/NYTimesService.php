<?php

namespace App\Services\NewsAPIs;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Carbon\Carbon;

class NYTimesService
{
    private string $apiKey;
    private string $baseUrl = 'https://api.nytimes.com/svc';

    public function __construct()
    {
        $this->apiKey = config('services.nyt.key', env('NYT_API_KEY'));
    }

    /**
     * Fetch articles from NY Times Article Search API
     */
    public function fetchArticles(array $parameters = []): array
    {
        $defaultParams = [
            'api-key' => $this->apiKey,
            'sort' => 'newest',
            'page' => 0,
        ];

        $params = array_merge($defaultParams, $parameters);

        try {
            $response = Http::timeout(30)->get($this->baseUrl . '/search/v2/articlesearch.json', $params);

            if ($response->successful()) {
                $data = $response->json();
                return $this->formatArticles($data['response']['docs'] ?? []);
            }

            Log::error('NY Times Article Search request failed', [
                'status' => $response->status(),
                'response' => $response->body()
            ]);

            return [];
        } catch (\Exception $e) {
            Log::error('NY Times Article Search service error', [
                'message' => $e->getMessage(),
                'params' => $params
            ]);

            return [];
        }
    }

    /**
     * Fetch top stories from NY Times
     */
    public function fetchTopStories(string $section = 'home'): array
    {
        try {
            $response = Http::timeout(30)->get($this->baseUrl . "/topstories/v2/{$section}.json", [
                'api-key' => $this->apiKey,
            ]);

            if ($response->successful()) {
                $data = $response->json();
                return $this->formatTopStories($data['results'] ?? []);
            }

            Log::error('NY Times Top Stories request failed', [
                'status' => $response->status(),
                'response' => $response->body()
            ]);

            return [];
        } catch (\Exception $e) {
            Log::error('NY Times Top Stories service error', [
                'message' => $e->getMessage(),
                'section' => $section
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
            'q' => $query,
            'api-key' => $this->apiKey,
            'sort' => 'newest',
            'page' => 0,
        ];

        $params = array_merge($defaultParams, $parameters);

        return $this->fetchArticles($params);
    }

    /**
     * Format articles from Article Search API to standardized structure
     */
    private function formatArticles(array $articles): array
    {
        return array_map(function ($article) {
            $multimedia = $article['multimedia'] ?? [];
            $imageUrl = null;
            
            if (!empty($multimedia)) {
                foreach ($multimedia as $media) {
                    if ($media['type'] === 'image') {
                        $imageUrl = 'https://nytimes.com/' . $media['url'];
                        break;
                    }
                }
            }

            return [
                'title' => $article['headline']['main'] ?? '',
                'description' => $article['snippet'] ?? $article['abstract'] ?? '',
                'content' => $article['lead_paragraph'] ?? $article['snippet'] ?? '',
                'url' => $article['web_url'] ?? '',
                'url_to_image' => $imageUrl,
                'published_at' => $article['pub_date'] ? Carbon::parse($article['pub_date']) : null,
                'author' => $this->extractAuthor($article['byline'] ?? null),
                'source_name' => 'The New York Times',
                'external_id' => $article['_id'] ?? $article['web_url'],
                'api_name' => 'nyt',
                'metadata' => [
                    'section_name' => $article['section_name'] ?? null,
                    'subsection_name' => $article['subsection_name'] ?? null,
                    'type_of_material' => $article['type_of_material'] ?? null,
                    'word_count' => $article['word_count'] ?? null,
                    'keywords' => $article['keywords'] ?? null,
                    'original_data' => $article
                ]
            ];
        }, $articles);
    }

    /**
     * Format articles from Top Stories API to standardized structure
     */
    private function formatTopStories(array $articles): array
    {
        return array_map(function ($article) {
            $imageUrl = null;
            if (!empty($article['multimedia'])) {
                foreach ($article['multimedia'] as $media) {
                    if ($media['format'] === 'mediumThreeByTwo440') {
                        $imageUrl = $media['url'];
                        break;
                    }
                }
                // Fallback to first image if specific format not found
                if (!$imageUrl && !empty($article['multimedia'][0]['url'])) {
                    $imageUrl = $article['multimedia'][0]['url'];
                }
            }

            return [
                'title' => $article['title'] ?? '',
                'description' => $article['abstract'] ?? '',
                'content' => $article['abstract'] ?? '',
                'url' => $article['url'] ?? '',
                'url_to_image' => $imageUrl,
                'published_at' => $article['published_date'] ? Carbon::parse($article['published_date']) : null,
                'author' => $article['byline'] ?? null,
                'source_name' => 'The New York Times',
                'external_id' => $article['uri'] ?? $article['url'],
                'api_name' => 'nyt',
                'metadata' => [
                    'section' => $article['section'] ?? null,
                    'subsection' => $article['subsection'] ?? null,
                    'material_type_facet' => $article['material_type_facet'] ?? null,
                    'kicker' => $article['kicker'] ?? null,
                    'original_data' => $article
                ]
            ];
        }, $articles);
    }

    /**
     * Extract author name from byline
     */
    private function extractAuthor($byline): ?string
    {
        if (!$byline) {
            return null;
        }

        if (is_string($byline)) {
            return $byline;
        }

        if (is_array($byline) && isset($byline['original'])) {
            return $byline['original'];
        }

        return null;
    }
}
