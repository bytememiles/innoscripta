<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Article;
use App\Models\Source;
use App\Models\Category;
use App\Services\NewsAPIs\NewsAPIService;
use App\Services\NewsAPIs\NewsDataService;
use App\Services\NewsAPIs\NYTimesService;
use Carbon\Carbon;
use Illuminate\Support\Str;

class ScrapeNewsCommand extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'news:scrape {--source=all} {--limit=100}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Scrape news articles from various APIs';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $sourceFilter = $this->option('source');
        $limit = (int) $this->option('limit');

        $this->info("Starting news scraping (limit: {$limit})...");

        $totalSaved = 0;

        if ($sourceFilter === 'all' || $sourceFilter === 'newsapi') {
            $totalSaved += $this->scrapeNewsAPI($limit);
        }

        if ($sourceFilter === 'all' || $sourceFilter === 'newsdata') {
            $totalSaved += $this->scrapeNewsData($limit);
        }

        if ($sourceFilter === 'all' || $sourceFilter === 'nyt') {
            $totalSaved += $this->scrapeNYTimes($limit);
        }

        $this->info("News scraping completed! Total articles saved: {$totalSaved}");
    }

    private function scrapeNewsAPI(int $limit): int
    {
        $this->info('Scraping NewsAPI...');
        
        $service = new NewsAPIService();
        $source = Source::where('api_name', 'newsapi')->first();
        
        if (!$source) {
            $this->error('NewsAPI source not found in database. Run news:seed-sources first.');
            return 0;
        }

        $articles = $service->fetchTopHeadlines(['pageSize' => min($limit, 100)]);
        
        return $this->saveArticles($articles, $source);
    }

    private function scrapeNewsData(int $limit): int
    {
        $this->info('Scraping NewsData.io...');
        
        $service = new NewsDataService();
        $source = Source::where('api_name', 'newsdata')->first();
        
        if (!$source) {
            $this->error('NewsData source not found in database. Run news:seed-sources first.');
            return 0;
        }

        $articles = $service->fetchLatestNews();
        
        return $this->saveArticles($articles, $source);
    }

    private function scrapeNYTimes(int $limit): int
    {
        $this->info('Scraping NY Times...');
        
        $service = new NYTimesService();
        $source = Source::where('api_name', 'nyt')->first();
        
        if (!$source) {
            $this->error('NY Times source not found in database. Run news:seed-sources first.');
            return 0;
        }

        $articles = $service->fetchTopStories();
        
        return $this->saveArticles($articles, $source);
    }

    private function saveArticles(array $articles, Source $source): int
    {
        $saved = 0;
        $skipped = 0;

        foreach ($articles as $articleData) {
            try {
                // Skip if URL already exists
                if (Article::where('url', $articleData['url'])->exists()) {
                    $skipped++;
                    continue;
                }

                // Try to match category based on metadata or content
                $category = $this->determineCategory($articleData);

                $article = Article::create([
                    'title' => Str::limit($articleData['title'], 255),
                    'description' => $articleData['description'],
                    'content' => $articleData['content'],
                    'url' => $articleData['url'],
                    'url_to_image' => $articleData['url_to_image'],
                    'published_at' => $articleData['published_at'] ?? Carbon::now(),
                    'author' => $articleData['author'],
                    'source_id' => $source->id,
                    'category_id' => $category?->id,
                    'language' => $articleData['metadata']['language'] ?? 'en',
                    'country' => $articleData['metadata']['country'] ?? null,
                    'external_id' => $articleData['external_id'],
                    'metadata' => $articleData['metadata'],
                ]);

                $saved++;
                
            } catch (\Exception $e) {
                $this->warn("Failed to save article: {$articleData['title']} - {$e->getMessage()}");
            }
        }

        $this->info("Saved: {$saved}, Skipped (duplicates): {$skipped}");
        
        return $saved;
    }

    private function determineCategory(array $articleData): ?Category
    {
        // Try to determine category from metadata
        if (isset($articleData['metadata']['category'])) {
            $categoryName = $articleData['metadata']['category'];
            $category = Category::where('slug', Str::slug($categoryName))->first();
            if ($category) {
                return $category;
            }
        }

        // Try to determine from NY Times section
        if (isset($articleData['metadata']['section'])) {
            $sectionName = $articleData['metadata']['section'];
            $mappedCategory = $this->mapSectionToCategory($sectionName);
            if ($mappedCategory) {
                return Category::where('slug', $mappedCategory)->first();
            }
        }

        // Fallback to general category
        return Category::where('slug', 'general')->first();
    }

    private function mapSectionToCategory(string $section): ?string
    {
        $mapping = [
            'business' => 'business',
            'technology' => 'technology',
            'science' => 'science',
            'health' => 'health',
            'sports' => 'sports',
            'entertainment' => 'entertainment',
            'politics' => 'politics',
            'world' => 'world',
            'arts' => 'entertainment',
            'opinion' => 'general',
            'style' => 'general',
            'food' => 'general',
            'travel' => 'general',
            'movies' => 'entertainment',
            'theater' => 'entertainment',
            'books' => 'entertainment',
        ];

        return $mapping[strtolower($section)] ?? null;
    }
}
