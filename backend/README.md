# News Aggregator - Laravel Backend

A comprehensive news aggregation system built with Laravel that collects, processes, and serves news articles from multiple APIs including NewsAPI, NewsData.io, and The New York Times.

## Features

- **Multi-API Integration**: Fetches news from NewsAPI, NewsData.io, and New York Times
- **Automated Data Scraping**: Scheduled commands for hourly news collection
- **PostgreSQL Database**: Robust data storage with full-text search capabilities
- **Docker Support**: Complete containerization with Docker and docker-compose
- **User Authentication**: Built-in authentication system with Laravel Sanctum
- **Article Management**: Categories, sources, and user preferences
- **Search & Filter**: Advanced filtering by date, category, source, and keywords
- **RESTful API**: Clean API endpoints for frontend consumption

## Tech Stack

- **Backend**: Laravel 10 (PHP 8.1)
- **Database**: PostgreSQL 15
- **Cache**: Redis
- **Containerization**: Docker & Docker Compose
- **Web Server**: Nginx
- **Process Manager**: Supervisor

## Quick Start with Docker

### Prerequisites

- Docker Desktop
- Docker Compose

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd innoscripta/backend
   ```

2. **Environment Setup**
   ```bash
   # Copy environment template
   cp .env.example .env
   ```
   
   Edit the `.env` file with your credentials:
   - Add your API keys for NewsAPI, NewsData.io, and New York Times
   - Configure SMTP settings for email functionality
   - Adjust database settings if needed (defaults work with Docker)

3. **Start Everything (One Command)**
   ```bash
   # Easy way - handles everything automatically
   ./start.sh
   ```
   
   **OR Manual Setup:**
   ```bash
   # Build and start services
   docker-compose up -d --build

   # Generate application key
   docker-compose exec backend php artisan key:generate
   
   # Run migrations
   docker-compose exec backend php artisan migrate --force

   # Seed sources and categories
   docker-compose exec backend php artisan news:seed-sources
   ```

5. **Test Email Configuration**
   ```bash
   # Test simple email
   docker-compose exec backend php artisan email:test

   # Test welcome email template
   docker-compose exec backend php artisan email:test --type=welcome
   ```

6. **Start News Scraping**
   ```bash
   # Manual scraping (optional)
   docker-compose exec backend php artisan news:scrape --limit=50
   ```

### Access the Application

- **Backend API**: http://localhost:8000
- **Database**: localhost:5432 (postgres/password)
- **Redis**: localhost:6380 (to avoid conflicts with system Redis)

## Quick Start Scripts

For convenience, use these scripts to manage your development environment:

```bash
# Start all services (builds, migrates, seeds data)
./start.sh

# Stop all services
./stop.sh

# Check status
docker compose ps

# View logs
docker compose logs -f backend
```

## API Endpoints

### Authentication
```
POST /api/register     - User registration
POST /api/login        - User login
POST /api/logout       - User logout
GET  /api/user         - Get authenticated user
```

### Articles
```
GET  /api/articles              - List articles with filtering
GET  /api/articles/{id}         - Get specific article
GET  /api/articles/search       - Search articles
```

### Categories & Sources
```
GET  /api/categories    - List all categories
GET  /api/sources       - List all sources
```

### User Preferences
```
GET  /api/preferences           - Get user preferences
POST /api/preferences           - Update user preferences
GET  /api/personalized-feed     - Get personalized news feed
```

## Manual Setup (Without Docker)

### Requirements

- PHP 8.1+
- Composer
- PostgreSQL
- Redis (optional)

### Installation Steps

1. **Install Dependencies**
   ```bash
   composer install
   ```

2. **Environment Configuration**
   ```bash
   cp .env.example .env
   php artisan key:generate
   ```

3. **Configure Database**
   Update `.env` file:
   ```env
   DB_CONNECTION=pgsql
   DB_HOST=127.0.0.1
   DB_PORT=5432
   DB_DATABASE=news_aggregator
   DB_USERNAME=postgres
   DB_PASSWORD=password
   ```

4. **Add API Keys and SMTP Configuration**
   Edit the `.env` file and add your credentials:
   ```env
   # News API Keys
   NEWSAPI_KEY=your_newsapi_key_here
   NEWSDATA_API_KEY=your_newsdata_key_here
   NYT_API_KEY=your_nyt_api_key_here
   
   # SMTP Email Configuration
   MAIL_MAILER=smtp
   MAIL_HOST=smtp.gmail.com
   MAIL_PORT=587
   MAIL_USERNAME=your_email@gmail.com
   MAIL_PASSWORD="your_app_password_here"
   MAIL_ENCRYPTION=tls
   MAIL_FROM_ADDRESS="your_email@gmail.com"
   MAIL_FROM_NAME="News Aggregator"
   ```

5. **Run Migrations and Seeds**
   ```bash
   php artisan migrate
   php artisan news:seed-sources
   ```

6. **Start the Application**
   ```bash
   php artisan serve
   ```

## Available Commands

### News Management
```bash
# Seed initial sources and categories
php artisan news:seed-sources

# Scrape news from all APIs
php artisan news:scrape

# Scrape from specific source
php artisan news:scrape --source=newsapi
php artisan news:scrape --source=newsdata
php artisan news:scrape --source=nyt

# Clean up old articles
php artisan news:cleanup --days=30

# Start Laravel scheduler (for automated scraping)
php artisan schedule:work
```

### Email Management
```bash
# Test email configuration (simple)
php artisan email:test

# Test welcome email template
php artisan email:test --type=welcome

# Test with custom recipient
php artisan email:test --to=your-email@example.com --type=welcome
```

### Production/Vendor Commands
```bash
# Install dependencies for production
docker compose exec backend composer install --no-dev --optimize-autoloader

# Run migrations
docker compose exec backend php artisan migrate --force

# Clear and cache configuration
docker compose exec backend php artisan config:clear && docker compose exec backend php artisan config:cache

# View recent logs
docker compose exec backend tail -20 storage/logs/laravel.log

# Search for errors in logs
docker compose exec backend grep -A 10 -B 10 "ERROR\|Exception\|Fatal" storage/logs/laravel.log | tail -30

# Test Redis connection
docker compose exec backend php artisan tinker --execute="use Illuminate\Support\Facades\Cache; Cache::put('test', 'Redis is working!', 60); echo Cache::get('test');"

# Check migration status
docker compose exec backend php artisan migrate:status
```

## Environment Configuration

The application uses a single `.env` file for all configuration. Key variables include:

### Application Settings
```env
APP_NAME="News Aggregator"
APP_ENV=local
APP_DEBUG=true
APP_URL=http://localhost:8000
APP_KEY=base64:your_generated_key_here
```

### Database Configuration
```env
DB_CONNECTION=pgsql
DB_HOST=db                    # 'db' for Docker, '127.0.0.1' for local
DB_PORT=5432
DB_DATABASE=news_aggregator
DB_USERNAME=postgres
DB_PASSWORD=password
```

### Redis Configuration
```env
REDIS_HOST=redis             # 'redis' for Docker, '127.0.0.1' for local
REDIS_PORT=6379
CACHE_DRIVER=redis
SESSION_DRIVER=redis
QUEUE_CONNECTION=redis
```

### Docker-specific Variables
```env
APP_PORT=8000                # External port for the application
REDIS_EXTERNAL_PORT=6380     # External port for Redis
```

## Scheduled Tasks

The application automatically runs these tasks:

- **Hourly**: News scraping from all APIs (limit: 50 articles)
- **Daily**: Cleanup of articles older than 30 days

## Database Schema

### Core Tables

- **users**: User accounts and authentication
- **sources**: News API sources (NewsAPI, NewsData, NYT)
- **categories**: Article categories (Business, Technology, etc.)
- **articles**: Main articles table with full-text search
- **user_preferences**: User personalization settings

### Key Features

- Full-text search on title, description, and content
- Foreign key relationships for data integrity
- JSON fields for flexible metadata storage
- Indexed fields for optimal query performance

## Development

### Code Quality

The project follows Laravel best practices:

- **SOLID Principles**: Clear separation of concerns
- **DRY**: Reusable service classes and components
- **KISS**: Simple, maintainable code structure

### Service Architecture

- **NewsAPIService**: Handles NewsAPI.org integration
- **NewsDataService**: Manages NewsData.io API calls
- **NYTimesService**: Processes NY Times API data

### Testing

```bash
# Run tests
php artisan test

# Run with coverage
php artisan test --coverage
```

## Security

### Environment Variables

**IMPORTANT**: Never commit sensitive credentials to version control!

- ✅ Use `.env.example` as a template  
- ✅ Copy to `.env` and add your real credentials
- ✅ Ensure `.env` is in `.gitignore`
- ❌ Never put real API keys or passwords in documentation
- ❌ Never commit `.env` files

### API Keys & Passwords

- Use environment-specific credentials
- Rotate API keys regularly
- Use Gmail App Passwords (not account passwords) for SMTP
- Consider using Docker secrets for production deployments

## Troubleshooting

### Common Issues

1. **Permission Errors**
   ```bash
   sudo chown -R $USER:$USER storage bootstrap/cache
   chmod -R 775 storage bootstrap/cache
   ```

2. **Database Connection**
   - Ensure PostgreSQL is running
   - Check database credentials in `.env`
   - Verify network connectivity in Docker

3. **API Rate Limits**
   - NewsAPI: 1000 requests/day (free tier)
   - NewsData.io: 200 requests/day (free tier)
   - NY Times: 1000 requests/day (free tier)

### Logs

```bash
# Application logs
tail -f storage/logs/laravel.log

# Docker logs
docker-compose logs -f backend
```

## API Documentation

Full API documentation will be available at `/api/documentation` once the frontend is integrated with tools like Swagger/OpenAPI.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is open-sourced software licensed under the [MIT license](LICENSE).

## Support

For support and questions, please contact the development team.