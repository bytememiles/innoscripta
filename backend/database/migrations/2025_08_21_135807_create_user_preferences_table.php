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
        Schema::create('user_preferences', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            $table->json('preferred_sources')->nullable(); // Array of source IDs
            $table->json('preferred_categories')->nullable(); // Array of category IDs
            $table->json('preferred_authors')->nullable(); // Array of author names
            $table->string('preferred_language')->default('en');
            $table->string('preferred_country')->nullable();
            $table->timestamps();
            
            $table->unique('user_id'); // One preference record per user
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('user_preferences');
    }
};
