#!/bin/bash

# News Aggregator Backend Stop Script
# This script stops all running containers

echo "🛑 Stopping News Aggregator Backend..."
echo "======================================"

# Colors for better output
BLUE='\033[0;34m'
GREEN='\033[0;32m'
NC='\033[0m' # No Color

print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

# Stop containers
print_status "Stopping Docker containers..."
docker compose down

print_success "All services stopped."
echo ""
print_status "To start again, run: ./start.sh"
