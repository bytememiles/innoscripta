<?php

namespace App\Jobs;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Str;
use App\Services\NewsScrapingService;

class ScrapeNewsJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public $timeout = 300; // 5 minutes
    public $tries = 1;
    
    private string $type;
    private array $filters;
    private ?string $userId;
    private string $jobId;

    /**
     * Create a new job instance.
     */
    public function __construct(string $type, array $filters = [], ?string $userId = null, ?string $jobId = null)
    {
        $this->type = $type;
        $this->filters = $filters;
        $this->userId = $userId;
        $this->jobId = $jobId ?? Str::uuid()->toString();
        
        // Set job metadata for tracking
        $this->onQueue('news-scraping');
        $this->delay(now()->addSeconds(1)); // Small delay to ensure job is properly queued
    }

    /**
     * Execute the job.
     */
    public function handle(): void
    {
        try {
            Log::info('ScrapeNewsJob started', [
                'type' => $this->type,
                'filters' => $this->filters,
                'user_id' => $this->userId,
                'job_id' => $this->jobId
            ]);
            
            $scrapingService = new NewsScrapingService();
            
            switch ($this->type) {
                case 'default':
                    Log::info('Starting default news scraping');
                    $scrapingService->scrapeForUser(0);
                    break;
                    
                case 'user_preferences':
                    Log::info('Starting user preferences scraping', ['user_id' => $this->userId]);
                    $scrapingService->scrapeForUser($this->userId);
                    break;
                    
                case 'filtered_search':
                    Log::info('Starting filtered search scraping', ['filters' => $this->filters]);
                    $scrapingService->scrapeForSearch($this->filters['keyword'] ?? '', $this->filters, $this->userId);
                    break;
                    
                default:
                    throw new \Exception("Unknown scraping type: {$this->type}");
            }
            
            Log::info('ScrapeNewsJob completed successfully', [
                'type' => $this->type,
                'filters' => $this->filters,
                'user_id' => $this->userId,
                'job_id' => $this->jobId
            ]);
            
        } catch (\Exception $e) {
            Log::error('ScrapeNewsJob failed', [
                'type' => $this->type,
                'filters' => $this->filters,
                'user_id' => $this->userId,
                'job_id' => $this->jobId,
                'error' => $e->getMessage()
            ]);
            
            throw $e;
        }
    }

    /**
     * Handle a job failure.
     */
    public function failed(\Throwable $exception): void
    {
        Log::error('ScrapeNewsJob failed permanently', [
            'type' => $this->type,
            'filters' => $this->filters,
            'user_id' => $this->userId,
            'job_id' => $this->jobId,
            'error' => $exception->getMessage()
        ]);
    }

    /**
     * Get the job identifier
     */
    public function getJobId(): string
    {
        return $this->jobId;
    }

    /**
     * Get the job type
     */
    public function getType(): string
    {
        return $this->type;
    }

    /**
     * Get the job filters
     */
    public function getFilters(): array
    {
        return $this->filters;
    }

    /**
     * Get the user ID
     */
    public function getUserId(): ?string
    {
        return $this->userId;
    }
}
