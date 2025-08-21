#!/bin/bash

# Generate API Documentation Script
# This script generates API documentation using Laravel Scribe

echo "🔄 Generating API documentation..."

# Check if we're in a Docker environment
if command -v docker compose &> /dev/null; then
    echo "📦 Running in Docker environment"
    
    # Check if Scribe is installed, if not install it
    echo "🔍 Checking if Scribe is installed..."
    if ! docker compose exec -T backend php artisan list | grep -q "scribe:generate"; then
        echo "📦 Installing Scribe package..."
        docker compose exec -T backend composer require --dev knuckleswtf/scribe
        docker compose exec -T backend composer dump-autoload
        echo "✅ Scribe installed successfully!"
    fi
    
    echo "📝 Generating documentation..."
    echo "yes" | docker compose exec -T backend php artisan scribe:generate
else
    echo "🖥️  Running in local environment"
    
    # Check if Scribe is installed, if not install it
    echo "🔍 Checking if Scribe is installed..."
    if ! php artisan list | grep -q "scribe:generate"; then
        echo "📦 Installing Scribe package..."
        composer require --dev knuckleswtf/scribe
        composer dump-autoload
        echo "✅ Scribe installed successfully!"
    fi
    
    echo "📝 Generating documentation..."
    echo "yes" | php artisan scribe:generate
fi

if [ $? -eq 0 ]; then
    echo "✅ API documentation generated successfully!"
    echo "🌐 View documentation at: http://localhost:8000/docs"
    echo "📊 OpenAPI spec at: http://localhost:8000/docs/openapi.yaml"
    echo "📮 Postman collection at: http://localhost:8000/docs/collection.json"
else
    echo "❌ Failed to generate documentation"
    exit 1
fi
