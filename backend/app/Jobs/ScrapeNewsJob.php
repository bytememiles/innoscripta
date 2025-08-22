<?php

namespace App\Jobs;

use App\Services\NewsScrapingService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Artisan;

class ScrapeNewsJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public $timeout = 300; // 5 minutes timeout
    public $tries = 3; // Retry 3 times if failed
    
    private string $type;
    private array $parameters;
    private ?int $userId;

    /**
     * Create a new job instance.
     */
    public function __construct(string $type, array $parameters = [], ?int $userId = null)
    {
        $this->type = $type;
        $this->parameters = $parameters;
        $this->userId = $userId;
    }

    /**
     * Execute the job.
     */
    public function handle(): void
    {
        try {
            $scrapingService = new NewsScrapingService();
            
            switch ($this->type) {
                case 'user_preferences':
                    $this->scrapeForUser($scrapingService);
                    break;
                    
                case 'search_query':
                    $this->scrapeForSearch($scrapingService);
                    break;
                    
                case 'category':
                    $this->scrapeForCategory($scrapingService);
                    break;
                    
                case 'default':
                    $this->scrapeDefault($scrapingService);
                    break;
                    
                default:
                    Log::error("Unknown scraping type: {$this->type}");
                    break;
            }
            
            Log::info("News scraping job completed successfully", [
                'type' => $this->type,
                'user_id' => $this->userId
            ]);
            
        } catch (\Exception $e) {
            Log::error("News scraping job failed", [
                'type' => $this->type,
                'user_id' => $this->userId,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            
            throw $e; // Re-throw to trigger retry mechanism
        }
    }

    /**
     * Scrape news for user preferences
     */
    private function scrapeForUser(NewsScrapingService $scrapingService): void
    {
        if (!$this->userId) {
            throw new \Exception('User ID is required for user preference scraping');
        }
        
        $articles = $scrapingService->scrapeForUser($this->userId, true);
        
        // Cache the results for the user
        $cacheKey = "user_articles_{$this->userId}";
        Cache::put($cacheKey, $articles, now()->addHours(2));
        
        Log::info("Scraped articles for user", [
            'user_id' => $this->userId,
            'articles_count' => count($articles)
        ]);
    }

    /**
     * Scrape news for search query
     */
    private function scrapeForSearch(NewsScrapingService $scrapingService): void
    {
        if (!isset($this->parameters['query'])) {
            throw new \Exception('Search query is required');
        }
        
        $query = $this->parameters['query'];
        $filters = $this->parameters['filters'] ?? [];
        
        $articles = $scrapingService->scrapeForSearch($query, $filters, $this->userId);
        
        // Cache the search results
        $cacheKey = "search_results_" . md5($query . json_encode($filters));
        Cache::put($cacheKey, $articles, now()->addHours(1));
        
        Log::info("Scraped articles for search", [
            'query' => $query,
            'filters' => $filters,
            'articles_count' => count($articles),
            'user_id' => $this->userId
        ]);
    }

    /**
     * Scrape news for specific category
     */
    private function scrapeForCategory(NewsScrapingService $scrapingService): void
    {
        if (!isset($this->parameters['category_slug'])) {
            throw new \Exception('Category slug is required');
        }
        
        $categorySlug = $this->parameters['category_slug'];
        
        // This would need to be implemented in the scraping service
        // For now, we'll use the existing command structure
        Artisan::call('news:scrape', [
            '--source' => 'all',
            '--limit' => 100
        ]);
        
        Log::info("Scraped articles for category", [
            'category_slug' => $categorySlug,
            'user_id' => $this->userId
        ]);
    }

    /**
     * Scrape default news
     */
    private function scrapeDefault(NewsScrapingService $scrapingService): void
    {
        $articles = $scrapingService->scrapeForUser(0, true); // 0 indicates default scraping
        
        // Cache the default results
        $cacheKey = "default_articles";
        Cache::put($cacheKey, $articles, now()->addHours(4));
        
        Log::info("Scraped default articles", [
            'articles_count' => count($articles)
        ]);
    }

    /**
     * Handle a job failure.
     */
    public function failed(\Throwable $exception): void
    {
        Log::error("News scraping job failed permanently", [
            'type' => $this->type,
            'user_id' => $this->userId,
            'parameters' => $this->parameters,
            'error' => $exception->getMessage()
        ]);
        
        // You could send a notification to admins here
        // or implement any other failure handling logic
    }
}
