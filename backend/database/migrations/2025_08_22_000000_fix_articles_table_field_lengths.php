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
        Schema::table('articles', function (Blueprint $table) {
            // Change title from varchar(255) to text to handle long titles
            $table->text('title')->nullable()->change();
            
            // Change author from varchar(255) to text to handle long author names
            $table->text('author')->nullable()->change();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('articles', function (Blueprint $table) {
            // Revert title back to varchar(255)
            $table->string('title')->change();
            
            // Revert author back to varchar(255)
            $table->string('author')->change();
        });
    }
};
