<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use App\Models\Source;

class SourceSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Check if sources already exist to prevent duplicate seeding
        if (Source::count() > 0) {
            $this->command->info('Sources already exist. Skipping seeding to prevent duplicates.');
            $this->command->info('Use "php artisan sources:reset" if you need to reseed sources.');
            return;
        }

        $sources = [
            [
                'name' => 'NewsAPI',
                'api_name' => 'newsapi',
                'slug' => 'newsapi-general',
                'description' => 'NewsAPI provides news articles from various sources',
                'base_url' => 'https://newsapi.org',
                'language' => 'en',
                'country' => 'us',
            ],
            [
                'name' => 'NewsData.io',
                'api_name' => 'newsdata',
                'slug' => 'newsdataio',
                'description' => 'NewsData.io provides news from multiple countries and languages',
                'base_url' => 'https://newsdata.io',
                'language' => 'en',
                'country' => 'us',
            ],
            [
                'name' => 'New York Times',
                'api_name' => 'nyt',
                'slug' => 'the-new-york-times',
                'description' => 'The New York Times is an American daily newspaper',
                'base_url' => 'https://www.nytimes.com',
                'language' => 'en',
                'country' => 'us',
            ],
            [
                'name' => 'BBC News',
                'api_name' => 'bbc',
                'slug' => 'bbc-news',
                'description' => 'BBC News is the operational business division of the BBC',
                'base_url' => 'https://www.bbc.com/news',
                'language' => 'en',
                'country' => 'gb',
            ],
            [
                'name' => 'Reuters',
                'api_name' => 'reuters',
                'slug' => 'reuters',
                'description' => 'Reuters is a British news agency',
                'base_url' => 'https://www.reuters.com',
                'language' => 'en',
                'country' => 'gb',
            ],
            [
                'name' => 'CNN',
                'api_name' => 'cnn',
                'slug' => 'cnn',
                'description' => 'CNN is a multinational news channel',
                'base_url' => 'https://www.cnn.com',
                'language' => 'en',
                'country' => 'us',
            ],
        ];

        $this->command->info('Seeding sources...');
        
        // Use database transaction for better data integrity
        DB::beginTransaction();
        
        try {
            foreach ($sources as $source) {
                $existingSource = Source::where('slug', $source['slug'])->first();
                
                if ($existingSource) {
                    $this->command->info("Updating existing source: {$source['name']} ({$source['slug']})");
                    $existingSource->update([
                        'name' => $source['name'],
                        'api_name' => $source['api_name'],
                        'description' => $source['description'],
                        'base_url' => $source['base_url'],
                        'language' => $source['language'],
                        'country' => $source['country'],
                        'is_active' => true,
                    ]);
                } else {
                    $this->command->info("Creating new source: {$source['name']} ({$source['slug']})");
                    Source::create([
                        'name' => $source['name'],
                        'slug' => $source['slug'],
                        'api_name' => $source['api_name'],
                        'description' => $source['description'],
                        'base_url' => $source['base_url'],
                        'language' => $source['language'],
                        'country' => $source['country'],
                        'is_active' => true,
                    ]);
                }
            }
            
            DB::commit();
            $this->command->info('Sources seeding completed successfully!');
            
        } catch (\Exception $e) {
            DB::rollBack();
            $this->command->error("Error seeding sources: " . $e->getMessage());
            $this->command->error("Rolling back changes...");
            throw $e; // Re-throw to stop the seeding process
        }
    }
}
