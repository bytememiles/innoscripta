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
        Schema::table('sources', function (Blueprint $table) {
            $table->string('slug')->nullable()->after('name');
        });
        
        // Populate slugs for existing sources
        $sources = \Illuminate\Support\Facades\DB::table('sources')->whereNull('slug')->get();
        
        foreach ($sources as $source) {
            \Illuminate\Support\Facades\DB::table('sources')
                ->where('id', $source->id)
                ->update(['slug' => \Illuminate\Support\Str::slug($source->name)]);
        }
        
        // Now make the column not nullable and unique
        Schema::table('sources', function (Blueprint $table) {
            $table->string('slug')->nullable(false)->unique()->change();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('sources', function (Blueprint $table) {
            $table->dropColumn('slug');
        });
    }
};
