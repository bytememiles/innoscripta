<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Drop existing tables in reverse dependency order
        Schema::dropIfExists('articles');
        Schema::dropIfExists('user_preferences');
        Schema::dropIfExists('personal_access_tokens');
        Schema::dropIfExists('password_reset_tokens');
        Schema::dropIfExists('failed_jobs');
        Schema::dropIfExists('categories');
        Schema::dropIfExists('sources');
        Schema::dropIfExists('users');

        // Recreate users table with UUID
        Schema::create('users', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('name');
            $table->string('email')->unique();
            $table->timestamp('email_verified_at')->nullable();
            $table->string('password');
            $table->rememberToken();
            $table->timestamps();
        });

        // Recreate categories table with UUID
        Schema::create('categories', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('name')->unique();
            $table->string('slug')->unique();
            $table->string('description')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        // Recreate sources table with UUID
        Schema::create('sources', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('name')->unique();
            $table->string('slug')->unique();
            $table->string('api_name');
            $table->string('base_url')->nullable();
            $table->string('description')->nullable();
            $table->string('language')->default('en');
            $table->string('country')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        // Recreate articles table with UUID
        Schema::create('articles', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('title');
            $table->text('description')->nullable();
            $table->longText('content')->nullable();
            $table->string('url')->unique();
            $table->string('url_to_image')->nullable();
            $table->timestamp('published_at');
            $table->string('author')->nullable();
            $table->uuid('source_id');
            $table->uuid('category_id')->nullable();
            $table->string('language')->default('en');
            $table->string('country')->nullable();
            $table->string('external_id')->nullable();
            $table->json('metadata')->nullable();
            $table->index(['published_at']);
            $table->index(['source_id', 'published_at']);
            $table->index(['category_id', 'published_at']);
            $table->fullText(['title', 'description', 'content']);
            $table->timestamps();

            $table->foreign('source_id')->references('id')->on('sources')->onDelete('cascade');
            $table->foreign('category_id')->references('id')->on('categories')->onDelete('set null');
        });

        // Recreate user_preferences table with UUID
        Schema::create('user_preferences', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('user_id');
            $table->json('preferred_sources')->nullable();
            $table->json('preferred_categories')->nullable();
            $table->json('preferred_authors')->nullable();
            $table->string('preferred_language')->nullable();
            $table->string('preferred_country')->nullable();
            $table->boolean('email_notifications')->default(true);
            $table->string('timezone')->nullable();
            $table->timestamps();

            $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');
        });

        // Recreate personal_access_tokens table with UUID
        Schema::create('personal_access_tokens', function (Blueprint $table) {
            $table->id();
            $table->uuidMorphs('tokenable');
            $table->string('name');
            $table->string('token', 64)->unique();
            $table->text('abilities')->nullable();
            $table->timestamp('last_used_at')->nullable();
            $table->timestamp('expires_at')->nullable();
            $table->timestamps();
        });

        // Recreate failed_jobs table with UUID
        Schema::create('failed_jobs', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->text('connection');
            $table->text('queue');
            $table->longText('payload');
            $table->longText('exception');
            $table->timestamp('failed_at')->useCurrent();
        });

        // Recreate password_reset_tokens table with UUID
        Schema::create('password_reset_tokens', function (Blueprint $table) {
            $table->string('email')->primary();
            $table->string('token');
            $table->timestamp('created_at')->nullable();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Drop tables in reverse dependency order
        Schema::dropIfExists('articles');
        Schema::dropIfExists('user_preferences');
        Schema::dropIfExists('personal_access_tokens');
        Schema::dropIfExists('password_reset_tokens');
        Schema::dropIfExists('failed_jobs');
        Schema::dropIfExists('categories');
        Schema::dropIfExists('sources');
        Schema::dropIfExists('users');

        // Recreate original tables with auto-incrementing IDs
        Schema::create('users', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('email')->unique();
            $table->timestamp('email_verified_at')->nullable();
            $table->string('password');
            $table->rememberToken();
            $table->timestamps();
        });

        Schema::create('categories', function (Blueprint $table) {
            $table->id();
            $table->string('name')->unique();
            $table->string('slug')->unique();
            $table->string('description')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        Schema::create('sources', function (Blueprint $table) {
            $table->id();
            $table->string('name')->unique();
            $table->string('api_name');
            $table->string('base_url')->nullable();
            $table->string('description')->nullable();
            $table->string('language')->default('en');
            $table->string('country')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

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
            $table->string('external_id')->nullable();
            $table->json('metadata')->nullable();
            $table->index(['published_at']);
            $table->index(['source_id', 'published_at']);
            $table->index(['category_id', 'published_at']);
            $table->fullText(['title', 'description', 'content']);
            $table->timestamps();
        });

        Schema::create('user_preferences', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            $table->json('preferred_sources')->nullable();
            $table->json('preferred_categories')->nullable();
            $table->json('preferred_authors')->nullable();
            $table->string('preferred_language')->nullable();
            $table->string('preferred_country')->nullable();
            $table->boolean('email_notifications')->default(true);
            $table->string('timezone')->nullable();
            $table->timestamps();
        });

        Schema::create('personal_access_tokens', function (Blueprint $table) {
            $table->id();
            $table->morphs('tokenable');
            $table->string('name');
            $table->string('token', 64)->unique();
            $table->text('abilities')->nullable();
            $table->timestamp('last_used_at')->nullable();
            $table->timestamp('expires_at')->nullable();
            $table->timestamps();
        });

        Schema::create('failed_jobs', function (Blueprint $table) {
            $table->id();
            $table->text('connection');
            $table->text('queue');
            $table->longText('payload');
            $table->longText('exception');
            $table->timestamp('failed_at')->useCurrent();
        });

        Schema::create('password_reset_tokens', function (Blueprint $table) {
            $table->string('email')->primary();
            $table->string('token');
            $table->timestamp('created_at')->nullable();
        });
    }
};
