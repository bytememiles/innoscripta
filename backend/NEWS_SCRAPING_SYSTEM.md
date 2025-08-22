# Intelligent News Scraping System

## Overview

The Intelligent News Scraping System is a comprehensive solution that addresses the challenges of news aggregation, user personalization, and security. It automatically scrapes news based on user preferences, prevents duplicate articles, implements rate limiting, and handles heavy scraping operations in the background.

## Key Features

### 1. Automatic News Scraping
- **User Registration**: When a user registers and no news exists, the system automatically scrapes news based on their preferences
- **Fallback Strategy**: If no user preferences exist, scrapes default news from general categories
- **Smart Caching**: Implements intelligent caching to reduce API calls and improve performance

### 2. Intelligent Search with Live Scraping
- **Real-time Scraping**: When users search for news, the system scrapes fresh content based on search queries
- **Duplicate Prevention**: Automatically detects and prevents duplicate articles using URL and external ID matching
- **Result Merging**: Combines existing database articles with newly scraped content for comprehensive results

### 3. Security and Abuse Prevention
- **Rate Limiting**: Implements multi-level rate limiting (minute, hour, day) per user and IP
- **Suspicious Request Detection**: Identifies and handles suspicious patterns like extremely long date ranges
- **Request Sanitization**: Validates and sanitizes all input parameters to prevent abuse

### 4. Background Processing
- **Queue-based Scraping**: Heavy scraping operations are processed in the background using Laravel queues
- **Non-blocking Operations**: Users get immediate feedback while scraping happens asynchronously
- **Retry Mechanism**: Failed scraping jobs are automatically retried with exponential backoff

## Architecture

### Core Components

#### 1. NewsScrapingService
The main service that orchestrates all news scraping operations:

```php
use App\Services\NewsScrapingService;

$scrapingService = new NewsScrapingService();

// Scrape news for specific user
$articles = $scrapingService->scrapeForUser($userId);

// Scrape news for search query
$articles = $scrapingService->scrapeForSearch($query, $filters, $userId);
```

#### 2. ScrapeNewsJob
Background job for handling heavy scraping operations:

```php
use App\Jobs\ScrapeNewsJob;

// Queue scraping job
ScrapeNewsJob::dispatch('user_preferences', [], $userId);
ScrapeNewsJob::dispatch('search_query', ['query' => 'AI'], $userId);
ScrapeNewsJob::dispatch('default');
```

#### 3. NewsScrapingRateLimit Middleware
Protects scraping endpoints from abuse:

```php
// Automatically applied to API routes
Route::middleware('api')->group(function () {
    Route::get('/articles/search', [ArticleController::class, 'search']);
    Route::get('/personalized-feed', [UserPreferenceController::class, 'personalizedFeed']);
});
```

### Data Flow

1. **User Request**: User requests news or searches for articles
2. **Cache Check**: System checks if results exist in cache
3. **Database Query**: Searches existing articles in database
4. **Scraping Decision**: Determines if additional scraping is needed
5. **Background Processing**: Queues scraping job if needed
6. **Result Merging**: Combines existing and new articles
7. **Response**: Returns results to user with scraping status

## Usage Examples

### 1. Scraping News for New User

When a user registers and visits the news page:

```bash
# The system automatically triggers scraping
php artisan news:scrape-user --user-id=123
php artisan news:scrape-user --email=user@example.com
```

### 2. Manual Scraping Commands

```bash
# Scrape for specific user
php artisan news:scrape-user --user-id=123

# Scrape for user by email
php artisan news:scrape-user --email=user@example.com

# Scrape default news for all users
php artisan news:scrape-user --default

# Use queue for background processing
php artisan news:scrape-user --user-id=123 --queue

# Force refresh ignoring cache
php artisan news:scrape-user --user-id=123 --force
```

### 3. API Endpoints

#### Get Articles (with auto-scraping)
```http
GET /api/articles
```

#### Search Articles (with live scraping)
```http
GET /api/articles/search?q=artificial intelligence&category=technology
```

#### Personalized Feed (with preference-based scraping)
```http
GET /api/personalized-feed
```

## Security Features

### Rate Limiting
- **Per Minute**: 30 requests per minute per user/IP
- **Per Hour**: 300 requests per hour per user/IP  
- **Per Day**: 1000 requests per day per user/IP

### Abuse Prevention
- **Date Range Limits**: Maximum 30 days between from_date and to_date
- **Category/Source Limits**: Maximum 5 categories or sources per request
- **Request Frequency**: Minimum 2 seconds between requests from same IP
- **Suspicious Pattern Detection**: Automatic detection of unusual request patterns

### Input Validation
- **Parameter Sanitization**: All input parameters are validated and sanitized
- **SQL Injection Prevention**: Uses parameterized queries and Eloquent ORM
- **XSS Protection**: Output is properly escaped and sanitized

## Performance Optimizations

### Caching Strategy
- **Search Results**: Cached for 15 minutes
- **User Articles**: Cached for 2 hours
- **Default Articles**: Cached for 4 hours
- **Source Articles**: Cached for 30 minutes

### Database Optimization
- **Indexes**: Optimized indexes on published_at, source_id, and category_id
- **Full-text Search**: PostgreSQL full-text search capabilities
- **Eager Loading**: Relationships are loaded efficiently to prevent N+1 queries

### Queue Management
- **Job Timeout**: 5 minutes per scraping job
- **Retry Logic**: 3 retries with exponential backoff
- **Failure Handling**: Comprehensive logging and error tracking

## Configuration

### Environment Variables
```env
# News API Keys
NEWSAPI_KEY=your_newsapi_key
NEWSDATA_API_KEY=your_newsdata_key
NYT_API_KEY=your_nyt_key

# Queue Configuration
QUEUE_CONNECTION=database
QUEUE_DRIVER=database

# Cache Configuration
CACHE_DRIVER=redis
CACHE_PREFIX=news_scraping
```

### Queue Setup
```bash
# Create queue tables
php artisan queue:table
php artisan migrate

# Start queue worker
php artisan queue:work --timeout=300
```

## Monitoring and Logging

### Log Files
- **Scraping Operations**: `storage/logs/laravel.log`
- **Rate Limiting**: Automatic logging of rate limit violations
- **Suspicious Requests**: Logging of potentially abusive requests

### Metrics to Monitor
- **Scraping Success Rate**: Percentage of successful scraping operations
- **Cache Hit Rate**: Effectiveness of caching strategy
- **Queue Performance**: Job processing times and failure rates
- **API Response Times**: Endpoint performance metrics

## Troubleshooting

### Common Issues

#### 1. No Articles After Registration
```bash
# Check if scraping jobs are running
php artisan queue:work

# Manually trigger scraping
php artisan news:scrape-user --user-id=123
```

#### 2. Rate Limit Errors
- Check user's request frequency
- Verify IP address isn't shared
- Review rate limiting configuration

#### 3. Scraping Failures
- Check API keys and quotas
- Verify network connectivity
- Review error logs for specific issues

### Debug Commands
```bash
# Check queue status
php artisan queue:failed
php artisan queue:retry all

# Clear cache
php artisan cache:clear

# Check scraping service
php artisan tinker
>>> app(App\Services\NewsScrapingService::class)->scrapeForUser(1)
```

## Best Practices

### 1. Queue Management
- Monitor queue workers and restart if needed
- Set appropriate job timeouts
- Implement dead letter queues for failed jobs

### 2. Cache Strategy
- Use Redis for better performance
- Implement cache warming for popular searches
- Monitor cache hit rates

### 3. API Management
- Rotate API keys regularly
- Monitor API quotas and usage
- Implement fallback APIs for redundancy

### 4. Security
- Regularly review rate limiting thresholds
- Monitor for suspicious activity patterns
- Keep dependencies updated

## Future Enhancements

### Planned Features
- **Machine Learning**: Intelligent article categorization and recommendation
- **Content Quality Scoring**: Filter out low-quality or duplicate content
- **Multi-language Support**: Scraping from multiple language sources
- **Real-time Updates**: WebSocket-based live news updates
- **Advanced Analytics**: User behavior analysis and content optimization

### Scalability Improvements
- **Horizontal Scaling**: Multiple queue workers and servers
- **CDN Integration**: Global content delivery optimization
- **Database Sharding**: Partition articles by date or category
- **Microservices**: Break down into smaller, focused services

## Support

For technical support or questions about the news scraping system:

1. Check the logs in `storage/logs/laravel.log`
2. Review this documentation
3. Check the queue status with `php artisan queue:failed`
4. Contact the development team with specific error messages and logs

---

*This system is designed to provide a robust, secure, and scalable solution for news aggregation while maintaining excellent user experience and preventing abuse.*
