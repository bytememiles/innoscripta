<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

class ValidateDatabaseSchemaCommand extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'db:validate-schema';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Validate database schema and identify potential issues';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('🔍 Validating database schema...');
        
        $issues = [];
        
        // Check articles table
        if (Schema::hasTable('articles')) {
            $this->info('Checking articles table...');
            
            // Check for long titles that might cause issues
            $longTitles = DB::table('articles')
                ->whereRaw('LENGTH(title) > 255')
                ->count();
            
            if ($longTitles > 0) {
                $issues[] = "Found {$longTitles} articles with titles longer than 255 characters";
            }
            
            // Check for long author names
            $longAuthors = DB::table('articles')
                ->whereNotNull('author')
                ->whereRaw('LENGTH(author) > 255')
                ->count();
            
            if ($longAuthors > 0) {
                $issues[] = "Found {$longAuthors} articles with author names longer than 255 characters";
            }
            
            // Check for long descriptions
            $longDescriptions = DB::table('articles')
                ->whereNotNull('description')
                ->whereRaw('LENGTH(description) > 65535')
                ->count();
            
            if ($longDescriptions > 0) {
                $issues[] = "Found {$longDescriptions} articles with descriptions longer than 65,535 characters";
            }
        }
        
        // Check sources table
        if (Schema::hasTable('sources')) {
            $this->info('Checking sources table...');
            
            $sourcesCount = DB::table('sources')->count();
            $this->info("Found {$sourcesCount} sources");
            
            // Check for duplicate slugs
            $duplicateSlugs = DB::table('sources')
                ->select('slug')
                ->groupBy('slug')
                ->havingRaw('COUNT(*) > 1')
                ->get();
            
            if ($duplicateSlugs->count() > 0) {
                $issues[] = "Found duplicate slugs: " . $duplicateSlugs->pluck('slug')->implode(', ');
            }
        }
        
        // Check categories table
        if (Schema::hasTable('categories')) {
            $this->info('Checking categories table...');
            
            $categoriesCount = DB::table('categories')->count();
            $this->info("Found {$categoriesCount} categories");
        }
        
        // Check user_preferences table
        if (Schema::hasTable('user_preferences')) {
            $this->info('Checking user_preferences table...');
            
            $preferencesCount = DB::table('user_preferences')->count();
            $this->info("Found {$preferencesCount} user preferences");
        }
        
        // Display results
        if (empty($issues)) {
            $this->info('✅ Database schema validation passed! No issues found.');
        } else {
            $this->warn('⚠️  Database schema validation found issues:');
            foreach ($issues as $issue) {
                $this->warn("  - {$issue}");
            }
            
            $this->info('');
            $this->info('To fix these issues, run:');
            $this->info('  php artisan migrate');
            $this->info('  php artisan sources:reset');
        }
        
        return empty($issues) ? 0 : 1;
    }
}
