#!/bin/bash

# News Aggregator Backend Startup Script
# This script handles all the setup and launch commands in one go

set -e  # Exit on any error

echo "🚀 Starting News Aggregator Backend with Intelligent News Scraping..."
echo "====================================================================="

# Colors for better output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    print_error "Docker is not running. Please start Docker Desktop first."
    exit 1
fi

# Check if .env file exists
if [ ! -f ".env" ]; then
    print_warning ".env file not found. Please create it from .env.example"
    if [ -f ".env.example" ]; then
        print_status "Copying .env.example to .env..."
        cp .env.example .env
        print_warning "Please edit .env file with your API keys and SMTP settings before continuing."
        exit 1
    else
        print_error "No .env.example file found. Please create .env file manually."
        exit 1
    fi
fi

# Build and start containers
print_status "Building and starting Docker containers..."
docker compose down --remove-orphans 2>/dev/null || true
docker compose up -d --build

# Wait for containers to be ready
print_status "Waiting for containers to be ready..."
sleep 10

# Check if containers are running
if ! docker compose ps | grep -q "Up"; then
    print_error "Some containers failed to start. Check logs with: docker compose logs"
    exit 1
fi

# Install/update composer dependencies
print_status "Installing PHP dependencies..."
docker compose exec backend composer install --no-dev --optimize-autoloader

# Generate app key if not set
if ! docker compose exec backend php -r "echo env('APP_KEY');" | grep -q "base64:"; then
    print_status "Generating application key..."
    docker compose exec backend php artisan key:generate --force
fi

# Clear caches
print_status "Clearing application caches..."
docker compose exec backend php artisan config:clear
docker compose exec backend php artisan cache:clear
docker compose exec backend php artisan route:clear

# Run database migrations
print_status "Running database migrations..."
if docker compose exec backend php artisan migrate --force; then
    print_success "Database migrations completed successfully!"
else
    print_error "Database migrations failed!"
    print_info "This might be due to existing data conflicts."
    print_info "You can try: docker compose exec backend php artisan migrate:fresh --seed"
    exit 1
fi

# Seed the database with initial data
print_status "Seeding database with initial data (sources, categories, user preferences)..."
if docker compose exec backend php artisan db:seed --force; then
    print_success "Database seeding completed successfully!"
else
    print_warning "Database seeding encountered issues (this might be normal if data already exists)"
    print_info "If you're experiencing duplicate key errors, you can reset sources with:"
    print_info "  docker compose exec backend php artisan sources:reset"
fi

# Validate database schema for potential issues
print_status "Validating database schema..."
if docker compose exec backend php artisan db:validate-schema; then
    print_success "Database schema validation passed!"
else
    print_warning "Database schema validation found issues that should be addressed"
    print_info "Run 'docker compose exec backend php artisan db:validate-schema' for details"
fi

# Set up queue system for intelligent news scraping
print_status "Setting up queue system for intelligent news scraping..."
# Note: We use our custom scraping_jobs table, not Laravel's default jobs table
# The queue system will work with our custom job tracking

# Note: Sources and categories are already seeded by the main db:seed command above
print_status "Sources and categories seeding completed via main seeder"

# Test Redis connection
print_status "Testing Redis connection..."
if docker compose exec backend php artisan tinker --execute="use Illuminate\Support\Facades\Cache; Cache::put('health_check', 'OK', 10); echo Cache::get('health_check');" 2>/dev/null | grep -q "OK"; then
    print_success "Redis connection working!"
else
    print_warning "Redis test failed, but continuing..."
fi

# Initialize with default news using intelligent scraping system
print_status "Initializing intelligent news scraping system..."
print_status "Scraping initial news articles (this may take a few minutes)..."

# Check if API keys are configured
if docker compose exec backend php -r "echo env('NEWSAPI_KEY') . env('NEWSDATA_API_KEY') . env('NYT_API_KEY');" | grep -q "your_newsapi_key_here\|your_newsdata_key_here\|your_nyt_key_here"; then
    print_warning "API keys not configured. Skipping initial news scraping."
    print_warning "Please update your .env file with valid API keys and run: docker exec -it news_aggregator_backend php artisan news:scrape-user --default"
else
    if docker compose exec backend php artisan news:scrape-user --default 2>/dev/null; then
        print_success "Initial news scraping completed successfully!"
    else
        print_warning "Initial news scraping failed or no new articles found - this is normal if articles already exist"
    fi
fi

# Start background queue worker for intelligent scraping
print_status "Starting background queue worker for intelligent news scraping..."
docker compose exec -d backend php artisan queue:work --timeout=300 --tries=3

# Test the intelligent scraping system (only if API keys are configured)
if docker compose exec backend php -r "echo env('NEWSAPI_KEY') . env('NEWSDATA_API_KEY') . env('NYT_API_KEY');" | grep -q "your_newsapi_key_here\|your_newsdata_key_here\|your_nyt_key_here"; then
    print_warning "API keys not configured. Skipping intelligent scraping system test."
else
    print_status "Testing intelligent news scraping system..."
    if docker compose exec backend php artisan news:scrape-user --default --queue 2>/dev/null; then
        print_success "Intelligent scraping system is working correctly!"
    else
        print_warning "Queue-based scraping test completed"
    fi
fi

# Display status
echo ""
echo "🎉 News Aggregator Backend with Intelligent News Scraping is ready!"
echo "=================================================================="
echo ""
print_success "Services running:"
echo "  📡 Backend API:    http://localhost:8000"
echo "  📖 API Docs:       http://localhost:8000/docs"
echo "  🗄️  PostgreSQL:    localhost:5432"
echo "  ⚡ Redis Cache:    localhost:6380"
echo "  🔄 Queue Worker:   Background processing active"
echo ""
print_status "Intelligent News Scraping Features:"
echo "  ✅ Auto-scraping for new users"
echo "  ✅ Preference-based news collection"
echo "  ✅ Live search scraping"
echo "  ✅ Background job processing"
echo "  ✅ Rate limiting and abuse prevention"
echo ""
print_status "Useful commands:"
echo "  📊 Check status:   docker compose ps"
echo "  📝 View logs:      docker compose logs -f backend"
echo "  🔄 Queue status:   docker exec -it news_aggregator_backend php artisan queue:failed"
echo "  🗞️  Scrape news:   docker exec -it news_aggregator_backend php artisan news:scrape-user --default"
echo "  🛑 Stop services:  docker compose down"
echo "  🔄 Restart:        ./start.sh"
echo "  🔍 Validate DB:    docker compose exec backend php artisan db:validate-schema"
echo "  🔄 Reset sources:  docker compose exec backend php artisan sources:reset"
echo ""
print_status "Test your API:"
echo "  curl http://localhost:8000/api/articles"
echo "  curl http://localhost:8000/api/categories"
echo ""

# Check API key configuration and provide guidance
if docker compose exec backend php -r "echo env('NEWSAPI_KEY') . env('NEWSDATA_API_KEY') . env('NYT_API_KEY');" | grep -q "your_newsapi_key_here\|your_newsdata_key_here\|your_nyt_key_here"; then
    echo ""
    print_warning "⚠️  IMPORTANT: API keys not configured!"
    echo "  To enable news scraping functionality, please:"
    echo "  1. Edit your .env file with valid API keys"
    echo "  2. Restart the services: ./start.sh"
    echo "  3. Or manually scrape: docker exec -it news_aggregator_backend php artisan news:scrape-user --default"
    echo ""
fi

# Optional: Show container status
print_status "Container status:"
docker compose ps

echo ""
print_success "Setup complete! Your News Aggregator backend with Intelligent News Scraping is running."
print_status "The system will automatically scrape news when users register or search for content."
