<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('articles', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->text('title'); // Use text() for long titles
            $table->text('description')->nullable();
            $table->longText('content')->nullable();
            $table->string('url')->unique();
            $table->string('url_to_image')->nullable();
            $table->timestamp('published_at');
            $table->text('author')->nullable(); // Use text() for long author names
            $table->uuid('source_id');
            $table->uuid('category_id')->nullable();
            $table->string('language')->default('en');
            $table->string('country')->nullable();
            $table->string('external_id')->nullable();
            $table->json('metadata')->nullable();
            $table->timestamps();

            // Indexes for performance
            $table->index(['published_at']);
            $table->index(['source_id', 'published_at']);
            $table->index(['category_id', 'published_at']);
            
            // Full-text search
            $table->fullText(['title', 'description', 'content']);

            // Foreign key constraints
            $table->foreign('source_id')->references('id')->on('sources')->onDelete('cascade');
            $table->foreign('category_id')->references('id')->on('categories')->onDelete('set null');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('articles');
    }
};
