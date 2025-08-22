<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ScrapingJob;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Queue;
use Illuminate\Support\Facades\Redis;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Cache;

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
            
            // Get jobs from database (persistent storage)
            $jobs = $this->getJobsFromDatabase($userId);
            
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
     *     "id": "job-uuid-here",
     *     "type": "filtered_search",
     *     "status": "in_progress",
     *     "filters": {
     *       "keyword": "artificial intelligence"
     *     },
     *     "created_at": "2024-01-15T10:30:00.000000Z",
     *     "started_at": "2024-01-15T10:31:00.000000Z",
     *     "completed_at": null,
     *     "failed_at": null,
     *     "error_message": null,
     *     "progress": 45
     *   }
     * }
     */
    public function getJobStatus(string $jobId, Request $request): JsonResponse
    {
        try {
            $userId = $request->user()?->id;
            
            // Get job status from database
            $job = $this->getJobFromDatabase($jobId, $userId);
            
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
            
            // Get job from database
            $job = $this->getJobFromDatabase($jobId, $userId);
            
            if (!$job) {
                return response()->json([
                    'success' => false,
                    'message' => 'Job not found'
                ], 404);
            }
            
            if ($job->status !== 'queued') {
                return response()->json([
                    'success' => false,
                    'message' => 'Cannot cancel job that is already running or completed'
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
     * Get jobs from database
     */
    private function getJobsFromDatabase(?string $userId): array
    {
        $query = ScrapingJob::query();
        
        if ($userId) {
            $query->where('user_id', $userId);
        } else {
            $query->whereNull('user_id');
        }
        
        return $query->orderBy('created_at', 'desc')->get()->toArray();
    }

    /**
     * Get specific job from database
     */
    private function getJobFromDatabase(string $jobId, ?string $userId): ?ScrapingJob
    {
        $query = ScrapingJob::where('id', $jobId);
        
        if ($userId) {
            $query->where('user_id', $userId);
        } else {
            $query->whereNull('user_id');
        }
        
        return $query->first();
    }

    /**
     * Update job status in database
     */
    private function updateJobStatus(string $jobId, string $status, ?string $userId): void
    {
        $job = $this->getJobFromDatabase($jobId, $userId);
        
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
                break;
            case 'cancelled':
                $updateData['cancelled_at'] = now();
                break;
        }
        
        $job->update($updateData);
    }
}
