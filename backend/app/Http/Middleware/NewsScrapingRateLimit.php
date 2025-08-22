<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;
use Symfony\Component\HttpFoundation\Response;

class NewsScrapingRateLimit
{
    // Rate limiting constants
    private const MAX_REQUESTS_PER_MINUTE = 30;
    private const MAX_REQUESTS_PER_HOUR = 300;
    private const MAX_REQUESTS_PER_DAY = 1000;
    
    // Cache keys for rate limiting
    private const RATE_LIMIT_MINUTE_KEY = 'news_scraping_rate_limit_minute';
    private const RATE_LIMIT_HOUR_KEY = 'news_scraping_rate_limit_hour';
    private const RATE_LIMIT_DAY_KEY = 'news_scraping_rate_limit_day';

    /**
     * Handle an incoming request.
     */
    public function handle(Request $request, Closure $next): Response
    {
        $userId = $request->user()?->id;
        $userKey = $userId ? "user_{$userId}" : 'anonymous';
        $ipAddress = $request->ip();
        
        // Check if this is a news scraping endpoint
        if (!$this->isNewsScrapingEndpoint($request)) {
            return $next($request);
        }
        
        // Check rate limits
        if (!$this->checkRateLimit($userKey, $ipAddress)) {
            Log::warning('News scraping rate limit exceeded', [
                'user_id' => $userId,
                'ip_address' => $ipAddress,
                'endpoint' => $request->path(),
                'method' => $request->method()
            ]);
            
            return response()->json([
                'success' => false,
                'message' => 'Rate limit exceeded. Please try again later.',
                'retry_after' => $this->getRetryAfterTime($userKey, $ipAddress)
            ], 429);
        }
        
        // Check for suspicious patterns
        if ($this->isSuspiciousRequest($request)) {
            Log::warning('Suspicious news scraping request detected', [
                'user_id' => $userId,
                'ip_address' => $ipAddress,
                'endpoint' => $request->path(),
                'parameters' => $request->all()
            ]);
            
            // Add extra delay for suspicious requests
            $this->addExtraDelay($userKey, $ipAddress);
        }
        
        return $next($request);
    }

    /**
     * Check if the request is for a news scraping endpoint
     */
    private function isNewsScrapingEndpoint(Request $request): bool
    {
        $scrapingEndpoints = [
            'api/articles/search',
            'api/personalized-feed',
            'api/articles'
        ];
        
        return in_array($request->path(), $scrapingEndpoints);
    }

    /**
     * Check rate limiting for user and IP
     */
    private function checkRateLimit(string $userKey, string $ipAddress): bool
    {
        // Check minute rate limit
        $minuteKey = self::RATE_LIMIT_MINUTE_KEY . "_{$userKey}_{$ipAddress}";
        $minuteCount = Cache::get($minuteKey, 0);
        
        if ($minuteCount >= self::MAX_REQUESTS_PER_MINUTE) {
            return false;
        }
        
        // Check hour rate limit
        $hourKey = self::RATE_LIMIT_HOUR_KEY . "_{$userKey}_{$ipAddress}";
        $hourCount = Cache::get($hourKey, 0);
        
        if ($hourCount >= self::MAX_REQUESTS_PER_HOUR) {
            return false;
        }
        
        // Check day rate limit
        $dayKey = self::RATE_LIMIT_DAY_KEY . "_{$userKey}_{$ipAddress}";
        $dayCount = Cache::get($dayKey, 0);
        
        if ($dayCount >= self::MAX_REQUESTS_PER_DAY) {
            return false;
        }
        
        // Increment counters
        Cache::put($minuteKey, $minuteCount + 1, now()->addMinute());
        Cache::put($hourKey, $hourCount + 1, now()->addHour());
        Cache::put($dayKey, $dayCount + 1, now()->addDay());
        
        return true;
    }

    /**
     * Check if the request is suspicious
     */
    private function isSuspiciousRequest(Request $request): bool
    {
        // Check for extremely long date ranges
        if ($request->has('from_date') && $request->has('to_date')) {
            $fromDate = \Carbon\Carbon::parse($request->from_date);
            $toDate = \Carbon\Carbon::parse($request->to_date);
            
            if ($fromDate->diffInDays($toDate) > 30) {
                return true;
            }
        }
        
        // Check for multiple category/source requests
        if ($request->has('category') && $request->has('source')) {
            $categories = explode(',', $request->category);
            $sources = explode(',', $request->source);
            
            if (count($categories) > 5 || count($sources) > 5) {
                return true;
            }
        }
        
        // Check for rapid successive requests
        $lastRequestKey = "last_request_{$request->ip()}";
        $lastRequest = Cache::get($lastRequestKey);
        
        if ($lastRequest && now()->diffInSeconds($lastRequest) < 2) {
            return true;
        }
        
        Cache::put($lastRequestKey, now(), now()->addMinute());
        
        return false;
    }

    /**
     * Add extra delay for suspicious requests
     */
    private function addExtraDelay(string $userKey, string $ipAddress): void
    {
        $delayKey = "extra_delay_{$userKey}_{$ipAddress}";
        Cache::put($delayKey, now()->addMinutes(5), now()->addMinutes(10));
    }

    /**
     * Get retry after time
     */
    private function getRetryAfterTime(string $userKey, string $ipAddress): int
    {
        $minuteKey = self::RATE_LIMIT_MINUTE_KEY . "_{$userKey}_{$ipAddress}";
        $hourKey = self::RATE_LIMIT_HOUR_KEY . "_{$userKey}_{$ipAddress}";
        $dayKey = self::RATE_LIMIT_DAY_KEY . "_{$userKey}_{$ipAddress}";
        
        $minuteExpiry = Cache::get($minuteKey . '_expiry');
        $hourExpiry = Cache::get($hourKey . '_expiry');
        $dayExpiry = Cache::get($dayKey . '_expiry');
        
        if ($minuteExpiry) {
            return max(0, $minuteExpiry - time());
        }
        
        if ($hourExpiry) {
            return max(0, $hourExpiry - time());
        }
        
        if ($dayExpiry) {
            return max(0, $dayExpiry - time());
        }
        
        return 60; // Default 1 minute
    }
}
