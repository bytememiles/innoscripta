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
            $table->id();
            $table->string('title');
            $table->text('description')->nullable();
            $table->longText('content')->nullable();
            $table->string('url')->unique();
            $table->string('url_to_image')->nullable();
            $table->timestamp('published_at');
            $table->string('author')->nullable();
            $table->foreignId('source_id')->constrained('sources')->onDelete('cascade');
            $table->foreignId('category_id')->nullable()->constrained('categories')->onDelete('set null');
            $table->string('language')->default('en');
            $table->string('country')->nullable();
            $table->string('external_id')->nullable(); // For tracking original API ID
            $table->json('metadata')->nullable(); // For storing additional API-specific data
            $table->index(['published_at']);
            $table->index(['source_id', 'published_at']);
            $table->index(['category_id', 'published_at']);
            $table->fullText(['title', 'description', 'content']);
            $table->timestamps();
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
