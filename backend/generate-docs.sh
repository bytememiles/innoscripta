#!/bin/bash

# Generate API Documentation Script
# This script generates API documentation using Laravel Scribe

echo "🔄 Generating API documentation..."

# Check if we're in a Docker environment
if command -v docker compose &> /dev/null; then
    echo "📦 Running in Docker environment"
    echo "yes" | docker compose exec -T backend php artisan scribe:generate
else
    echo "🖥️  Running in local environment"
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
