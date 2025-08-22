#!/bin/bash

# News Aggregator API Key Configuration Helper
# This script helps users configure their API keys for news services

set -e

echo "🔑 News Aggregator API Key Configuration Helper"
echo "================================================"
echo ""

# Colors for better output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

print_info() {
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

# Check if .env file exists
if [ ! -f ".env" ]; then
    print_error ".env file not found!"
    print_info "Please run ./start.sh first to create the .env file."
    exit 1
fi

echo "This script will help you configure your API keys for news services."
echo "You'll need to get API keys from the following providers:"
echo ""
echo "📰 NewsAPI.org:     https://newsapi.org/register (Free: 1000 requests/day)"
echo "📊 NewsData.io:     https://newsdata.io/register (Free: 200 requests/day)"
echo "🗞️  New York Times: https://developer.nytimes.com/ (Free: 1000 requests/day)"
echo ""
echo "Note: All services offer free tiers that are sufficient for development."
echo ""

read -p "Do you want to continue? (y/N): " -n 1 -r
echo ""
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    print_info "Configuration cancelled. You can run this script again later."
    exit 0
fi

echo ""
print_info "Let's configure your API keys one by one:"
echo ""

# NewsAPI Key
echo "1️⃣  NewsAPI.org API Key"
echo "   - Visit: https://newsapi.org/register"
echo "   - Sign up for a free account"
echo "   - Copy your API key"
echo ""
read -p "Enter your NewsAPI key (or press Enter to skip): " NEWSAPI_KEY

# NewsData Key
echo ""
echo "2️⃣  NewsData.io API Key"
echo "   - Visit: https://newsdata.io/register"
echo "   - Sign up for a free account"
echo "   - Copy your API key"
echo ""
read -p "Enter your NewsData key (or press Enter to skip): " NEWSDATA_KEY

# NYT Key
echo ""
echo "3️⃣  New York Times API Key"
echo "   - Visit: https://developer.nytimes.com/"
echo "   - Sign up for a free account"
echo "   - Copy your API key"
echo ""
read -p "Enter your NYT key (or press Enter to skip): " NYT_KEY

echo ""
print_info "Updating your .env file..."

# Update .env file
if [ ! -z "$NEWSAPI_KEY" ]; then
    sed -i "s/NEWSAPI_KEY=.*/NEWSAPI_KEY=$NEWSAPI_KEY/" .env
    print_success "NewsAPI key configured"
else
    print_warning "NewsAPI key skipped"
fi

if [ ! -z "$NEWSDATA_KEY" ]; then
    sed -i "s/NEWSDATA_API_KEY=.*/NEWSDATA_API_KEY=$NEWSDATA_KEY/" .env
    print_success "NewsData key configured"
else
    print_warning "NewsData key skipped"
fi

if [ ! -z "$NYT_KEY" ]; then
    sed -i "s/NYT_API_KEY=.*/NYT_API_KEY=$NYT_KEY/" .env
    print_success "NYT key configured"
else
    print_warning "NYT key skipped"
fi

echo ""
print_success "API key configuration completed!"
echo ""

# Check if at least one key is configured
if [ ! -z "$NEWSAPI_KEY" ] || [ ! -z "$NEWSDATA_KEY" ] || [ ! -z "$NYT_KEY" ]; then
    print_info "You can now test the news scraping system:"
    echo "  docker exec -it news_aggregator_backend php artisan news:scrape-user --default"
    echo ""
    print_info "Or restart the entire system to apply changes:"
    echo "  ./start.sh"
else
    print_warning "No API keys were configured."
    print_info "You can run this script again later to add API keys."
fi

echo ""
print_info "For more information, check the README.md file."
