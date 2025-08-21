#!/bin/bash

# News Aggregator Backend Startup Script
# This script handles all the setup and launch commands in one go

set -e  # Exit on any error

echo "🚀 Starting News Aggregator Backend..."
echo "======================================"

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
docker compose exec backend php artisan migrate --force

# Seed initial data (sources and categories)
print_status "Seeding initial data..."
docker compose exec backend php artisan news:seed-sources || print_warning "Seeding failed - this might be normal if data already exists"

# Test Redis connection
print_status "Testing Redis connection..."
if docker compose exec backend php artisan tinker --execute="use Illuminate\Support\Facades\Cache; Cache::put('health_check', 'OK', 10); echo Cache::get('health_check');" 2>/dev/null | grep -q "OK"; then
    print_success "Redis connection working!"
else
    print_warning "Redis test failed, but continuing..."
fi

# Display status
echo ""
echo "🎉 News Aggregator Backend is ready!"
echo "====================================="
echo ""
print_success "Services running:"
echo "  📡 Backend API:    http://localhost:8000"
echo "  🗄️  PostgreSQL:    localhost:5432"
echo "  ⚡ Redis Cache:    localhost:6380"
echo ""
print_status "Useful commands:"
echo "  📊 Check status:   docker compose ps"
echo "  📝 View logs:      docker compose logs -f backend"
echo "  🛑 Stop services:  docker compose down"
echo "  🔄 Restart:        ./start.sh"
echo ""
print_status "Test your API:"
echo "  curl http://localhost:8000"
echo ""

# Optional: Show container status
print_status "Container status:"
docker compose ps

echo ""
print_success "Setup complete! Your News Aggregator backend is running."
