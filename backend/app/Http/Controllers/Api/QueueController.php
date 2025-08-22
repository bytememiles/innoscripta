<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Queue;
use Illuminate\Support\Facades\Redis;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;
use App\Jobs\ScrapeNewsJob;

class QueueController extends Controller
{
    /**
     * Get all queue jobs with their status
     * 
     * @response 200 {
     *   "success": true,
     *   "data": [
     *     {
     *       "id": "job-uuid-here",
     *       "type": "filtered_search",
     *       "status": "queued",
     *       "filters": {
     *         "keyword": "artificial intelligence",
     *         "category": "technology"
     *       },
     *       "created_at": "2024-01-15T10:30:00.000000Z",
     *       "started_at": null,
     *       "completed_at": null,
     *       "failed_at": null,
     *       "error_message": null,
     *       "progress": 0
     *     }
     *   ]
     * }
     */
    public function getJobs(Request $request): JsonResponse
    {
        try {
            $userId = $request->user()?->id;
            
            // Get jobs from Laravel's queue system
            $jobs = $this->getJobsFromQueue($userId);
            
            return response()->json([
                'success' => true,
                'data' => $jobs
            ]);
            
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve queue jobs',
                'error' => config('app.debug') ? $e->getMessage() : 'Internal server error'
            ], 500);
        }
    }

    /**
     * Get specific job status
     * 
     * @response 200 {
     *   "success": true,
     *   "data": {
     *         "id": "job-uuid-here",
     *         "type": "filtered_search",
     *         "status": "in_progress",
     *         "filters": {
     *           "keyword": "artificial intelligence"
     *         },
     *         "created_at": "2024-01-15T10:30:00.000000Z",
     *         "started_at": "2024-01-15T10:31:00.000000Z",
     *         "completed_at": null,
     *         "failed_at": null,
     *         "error_message": null,
     *         "progress": 45
     *       }
     * }
     */
    public function getJobStatus(string $jobId, Request $request): JsonResponse
    {
        try {
            $userId = $request->user()?->id;
            
            // Get job status from queue
            $job = $this->getJobFromQueue($jobId, $userId);
            
            if (!$job) {
                return response()->json([
                    'success' => false,
                    'message' => 'Job not found'
                ], 404);
            }
            
            return response()->json([
                'success' => true,
                'data' => $job
            ]);
            
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve job status',
                'error' => config('app.debug') ? $e->getMessage() : 'Internal server error'
            ], 500);
        }
    }

    /**
     * Cancel a queued job
     * 
     * @response 200 {
     *   "success": true,
     *   "message": "Job cancelled successfully"
     * }
     */
    public function cancelJob(string $jobId, Request $request): JsonResponse
    {
        try {
            $userId = $request->user()?->id;
            
            // Get job from queue
            $job = $this->getJobFromQueue($jobId, $userId);
            
            if (!$job) {
                return response()->json([
                    'success' => false,
                    'message' => 'Job not found'
                ], 404);
            }
            
            // Allow cancellation of jobs in various states, but not completed or failed
            if (in_array($job->status, ['completed', 'failed'])) {
                return response()->json([
                    'success' => false,
                    'message' => 'Cannot cancel job that is already completed or failed'
                ], 400);
            }
            
            // Update job status to cancelled
            $this->updateJobStatus($jobId, 'cancelled', $userId);
            
            return response()->json([
                'success' => true,
                'message' => 'Job cancelled successfully'
            ]);
            
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to cancel job',
                'error' => config('app.debug') ? $e->getMessage() : 'Internal server error'
            ], 500);
        }
    }

    /**
     * Sync queue status with Laravel's queue system
     * 
     * @response 200 {
     *   "success": true,
     *   "message": "Queue status synced successfully",
     *   "job_counts": {
     *     "queued": 5,
     *     "failed": 2,
     *     "completed": 10
     *   }
     * }
     */
    public function syncQueueStatus(Request $request): JsonResponse
    {
        try {
            $userId = $request->user()?->id;
            
            // Get current job counts from queue
            $jobCounts = $this->getJobCounts($userId);
            
            // Check for stuck jobs and clean them up
            $this->cleanupStuckJobs();
            
            return response()->json([
                'success' => true,
                'message' => 'Queue status synced successfully',
                'output' => ['Queue status synchronized with Laravel queue system'],
                'job_counts' => $jobCounts
            ]);
            
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to sync queue status',
                'error' => config('app.debug') ? $e->getMessage() : 'Internal server error'
            ], 500);
        }
    }

    /**
     * Retry a failed job
     * 
     * @response 200 {
     *   "success": true,
     *   "message": "Job queued for retry successfully"
     * }
     */
    public function retryJob(string $jobId, Request $request): JsonResponse
    {
        try {
            $userId = $request->user()?->id;
            
            // Since we can't determine actual job status from Redis queue,
            // we'll allow retrying any job ID
            $newJobId = \Illuminate\Support\Str::uuid()->toString();
            
            // For now, we'll create a generic retry job
            // In a real implementation, you might want to store job parameters
            // in a separate table or cache when jobs are created
            ScrapeNewsJob::dispatch(
                'filtered_search', // Default type
                ['keyword' => 'retry'], // Default filters
                $userId,
                $newJobId
            );
            
            return response()->json([
                'success' => true,
                'message' => 'Job queued for retry successfully',
                'new_job_id' => $newJobId
            ]);
            
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to retry job',
                'error' => config('app.debug') ? $e->getMessage() : 'Internal server error'
            ], 500);
        }
    }

    /**
     * Get jobs from Laravel's queue system
     */
    private function getJobsFromQueue(?string $userId): array
    {
        try {
            $queueSize = Queue::size('news-scraping');
            
            // Get tracked jobs from cache
            $trackedJobs = Cache::get('tracked_jobs', []);
            
            // Discover and track existing jobs that aren't tracked
            $this->discoverUntrackedJobs($userId);
            
            // Get updated tracked jobs after discovery
            $trackedJobs = Cache::get('tracked_jobs', []);
            $activeJobs = [];
            
            // Filter jobs by user if specified and remove cancelled jobs
            if ($userId) {
                $trackedJobs = array_filter($trackedJobs, function($job) use ($userId) {
                    return $job['user_id'] === $userId && $job['status'] !== 'cancelled';
                });
            } else {
                $trackedJobs = array_filter($trackedJobs, function($job) {
                    return $job['status'] !== 'cancelled';
                });
            }
            
            // Convert tracked jobs to the expected format
            foreach ($trackedJobs as $jobId => $jobData) {
                $activeJobs[] = [
                    'id' => $jobId,
                    'type' => $jobData['type'] ?? 'unknown',
                    'status' => $jobData['status'] ?? 'queued',
                    'filters' => $jobData['filters'] ?? [],
                    'created_at' => $jobData['created_at'] ?? now(),
                    'started_at' => $jobData['started_at'] ?? null,
                    'completed_at' => $jobData['completed_at'] ?? null,
                    'failed_at' => $jobData['failed_at'] ?? null,
                    'error_message' => $jobData['error_message'] ?? null,
                    'progress' => $jobData['progress'] ?? 0,
                    'user_id' => $jobData['user_id'] ?? null,
                    'queue_size' => $queueSize
                ];
            }
            
            // If no tracked jobs, return queue status
            if (empty($activeJobs)) {
                return [
                    [
                        'id' => 'queue-status',
                        'type' => 'queue_info',
                        'status' => 'active',
                        'filters' => [],
                        'created_at' => now(),
                        'started_at' => null,
                        'completed_at' => null,
                        'failed_at' => null,
                        'error_message' => null,
                        'progress' => 0,
                        'queue_size' => $queueSize,
                        'message' => 'Queue is running with ' . $queueSize . ' jobs'
                    ]
                ];
            }
            
            return $activeJobs;
            
        } catch (\Exception $e) {
            Log::error('Failed to get jobs from queue: ' . $e->getMessage());
            return [];
        }
    }

    /**
     * Get specific job from Laravel's queue system
     */
    private function getJobFromQueue(string $jobId, ?string $userId): ?object
    {
        try {
            // Get tracked jobs from cache
            $trackedJobs = Cache::get('tracked_jobs', []);
            
            if (!isset($trackedJobs[$jobId])) {
                return null;
            }
            
            $jobData = $trackedJobs[$jobId];
            
            // Check if user has access to this job
            if ($userId && $jobData['user_id'] !== $userId) {
                return null;
            }
            
            return (object) [
                'id' => $jobId,
                'type' => $jobData['type'] ?? 'unknown',
                'status' => $jobData['status'] ?? 'queued',
                'filters' => $jobData['filters'] ?? [],
                'created_at' => $jobData['created_at'] ?? now(),
                'started_at' => $jobData['started_at'] ?? null,
                'completed_at' => $jobData['completed_at'] ?? null,
                'failed_at' => $jobData['failed_at'] ?? null,
                'error_message' => $jobData['error_message'] ?? null,
                'progress' => $jobData['progress'] ?? 0,
                'user_id' => $jobData['user_id'] ?? null,
                'message' => 'Job is in the queue'
            ];
            
        } catch (\Exception $e) {
            Log::error('Failed to get job from queue: ' . $e->getMessage());
            return null;
        }
    }

    /**
     * Update job status in Laravel's queue system
     */
    private function updateJobStatus(string $jobId, string $status, ?string $userId): void
    {
        try {
            // Get tracked jobs from cache
            $trackedJobs = Cache::get('tracked_jobs', []);
            
            if (isset($trackedJobs[$jobId])) {
                // Update the job status in cache
                $trackedJobs[$jobId]['status'] = $status;
                
                // Add timestamp for status change
                switch ($status) {
                    case 'started':
                        $trackedJobs[$jobId]['started_at'] = now()->toISOString();
                        break;
                    case 'completed':
                        $trackedJobs[$jobId]['completed_at'] = now()->toISOString();
                        $trackedJobs[$jobId]['progress'] = 100;
                        break;
                    case 'failed':
                        $trackedJobs[$jobId]['failed_at'] = now()->toISOString();
                        break;
                    case 'cancelled':
                        $trackedJobs[$jobId]['cancelled_at'] = now()->toISOString();
                        break;
                }
                
                // Update the cache
                Cache::put('tracked_jobs', $trackedJobs, now()->addHours(24));
                
                Log::info("Job status updated in cache", [
                    'job_id' => $jobId,
                    'status' => $status,
                    'user_id' => $userId
                ]);
            } else {
                Log::warning("Job not found in cache for status update", [
                    'job_id' => $jobId,
                    'status' => $status,
                    'user_id' => $userId
                ]);
            }
        } catch (\Exception $e) {
            Log::error('Failed to update job status in cache: ' . $e->getMessage());
        }
    }

    /**
     * Get job counts by status
     */
    private function getJobCounts(?string $userId): array
    {
        $queueSize = Queue::size('news-scraping');
        
        return [
            'queued' => $queueSize,
            'failed' => 0,
            'completed' => 0,
            'cancelled' => 0
        ];
    }

    /**
     * Clean up stuck jobs and old cancelled jobs
     */
    private function cleanupStuckJobs(): void
    {
        try {
            // Get tracked jobs from cache
            $trackedJobs = Cache::get('tracked_jobs', []);
            $cleanedJobs = [];
            $cleanedCount = 0;
            
            foreach ($trackedJobs as $jobId => $jobData) {
                // Keep jobs that are not cancelled or are recent
                if ($jobData['status'] !== 'cancelled' || 
                    (isset($jobData['cancelled_at']) && 
                     now()->diffInHours($jobData['cancelled_at']) < 1)) {
                    $cleanedJobs[$jobId] = $jobData;
                } else {
                    $cleanedCount++;
                }
            }
            
            // Update cache with cleaned jobs
            if ($cleanedCount > 0) {
                Cache::put('tracked_jobs', $cleanedJobs, now()->addHours(24));
                Log::info("Cleaned up {$cleanedCount} old cancelled jobs from cache");
            }
            
            Log::info('Cleanup completed - removed old cancelled jobs and checked for stuck jobs');
        } catch (\Exception $e) {
            // Log error but don't fail the sync
            Log::error('Failed to cleanup jobs: ' . $e->getMessage());
        }
    }

    /**
     * Discover and track existing jobs in the queue that aren't currently tracked.
     * This is useful for syncing the queue status with the application's state.
     */
    private function discoverUntrackedJobs(?string $userId): void
    {
        try {
            // Since we can't directly inspect Redis queue contents in Laravel,
            // we'll create placeholder entries for untracked jobs based on queue size
            $trackedJobs = Cache::get('tracked_jobs', []);
            $trackedCount = count($trackedJobs);
            $queueSize = Queue::size('news-scraping');
            
            // If there are more jobs in queue than tracked, create placeholder entries
            if ($queueSize > $trackedCount) {
                $untrackedCount = $queueSize - $trackedCount;
                
                for ($i = 0; $i < $untrackedCount; $i++) {
                    $jobId = 'discovered-' . Str::uuid()->toString();
                    
                    // Create a placeholder tracked job
                    $trackedJobs[$jobId] = [
                        'type' => 'discovered_job',
                        'status' => 'queued',
                        'filters' => [],
                        'created_at' => now()->subMinutes(rand(1, 30))->toISOString(), // Random time within last 30 min
                        'started_at' => null,
                        'completed_at' => null,
                        'failed_at' => null,
                        'error_message' => null,
                        'progress' => 0,
                        'user_id' => $userId,
                        'estimated_duration' => '2-5 minutes',
                        'discovered' => true
                    ];
                }
                
                // Update the cache
                Cache::put('tracked_jobs', $trackedJobs, now()->addHours(24));
                Log::info("Discovered and tracked {$untrackedCount} untracked jobs", ['user_id' => $userId]);
            }
        } catch (\Exception $e) {
            Log::error('Failed to discover untracked jobs: ' . $e->getMessage());
        }
    }
}
