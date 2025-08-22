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
use App\Models\ScrapingJob;

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
        
        // Initialize job in database
        $this->initializeJobInDatabase();
    }

    /**
     * Execute the job.
     */
    public function handle(): void
    {
        try {
            // Update job status to started
            $this->updateJobStatus('started');
            
            $scrapingService = new NewsScrapingService();
            
            switch ($this->type) {
                case 'default':
                    $this->updateJobProgress(25);
                    $scrapingService->scrapeForUser(0);
                    break;
                    
                case 'user_preferences':
                    $this->updateJobProgress(25);
                    $scrapingService->scrapeForUser($this->userId);
                    break;
                    
                case 'filtered_search':
                    $this->updateJobProgress(25);
                    $scrapingService->scrapeForSearch($this->filters['keyword'] ?? '', $this->filters, $this->userId);
                    break;
                    
                default:
                    throw new \Exception("Unknown scraping type: {$this->type}");
            }
            
            // Update job status to completed
            $this->updateJobStatus('completed');
            
        } catch (\Exception $e) {
            Log::error('ScrapeNewsJob failed', [
                'type' => $this->type,
                'filters' => $this->filters,
                'user_id' => $this->userId,
                'job_id' => $this->jobId,
                'error' => $e->getMessage()
            ]);
            
            // Update job status to failed
            $this->updateJobStatus('failed', $e->getMessage());
            
            throw $e;
        }
    }

    /**
     * Initialize job in database
     */
    private function initializeJobInDatabase(): void
    {
        ScrapingJob::create([
            'id' => $this->jobId,
            'type' => $this->type,
            'status' => 'queued',
            'filters' => $this->filters,
            'user_id' => $this->userId,
            'progress' => 0
        ]);
    }

    /**
     * Update job status in database
     */
    private function updateJobStatus(string $status, ?string $errorMessage = null): void
    {
        $job = ScrapingJob::find($this->jobId);
        
        if (!$job) {
            return;
        }
        
        $updateData = ['status' => $status];
        
        switch ($status) {
            case 'started':
                $updateData['started_at'] = now();
                break;
            case 'completed':
                $updateData['completed_at'] = now();
                $updateData['progress'] = 100;
                break;
            case 'failed':
                $updateData['failed_at'] = now();
                $updateData['error_message'] = $errorMessage;
                break;
        }
        
        $job->update($updateData);
    }

    /**
     * Update job progress in database
     */
    private function updateJobProgress(int $progress): void
    {
        $job = ScrapingJob::find($this->jobId);
        
        if ($job) {
            $job->update(['progress' => $progress]);
        }
    }
}
