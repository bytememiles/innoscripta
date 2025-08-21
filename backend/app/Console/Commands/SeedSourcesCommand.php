<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Source;
use App\Models\Category;

class SeedSourcesCommand extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'news:seed-sources';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Seed initial news sources and categories';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('Seeding news sources and categories...');

        // Seed categories
        $this->seedCategories();
        
        // Seed sources
        $this->seedSources();

        $this->info('Seeding completed successfully!');
    }

    private function seedCategories()
    {
        $categories = [
            ['name' => 'Business', 'slug' => 'business', 'description' => 'Business and finance news'],
            ['name' => 'Technology', 'slug' => 'technology', 'description' => 'Technology and innovation news'],
            ['name' => 'Science', 'slug' => 'science', 'description' => 'Science and research news'],
            ['name' => 'Health', 'slug' => 'health', 'description' => 'Health and medical news'],
            ['name' => 'Sports', 'slug' => 'sports', 'description' => 'Sports news and updates'],
            ['name' => 'Entertainment', 'slug' => 'entertainment', 'description' => 'Entertainment and celebrity news'],
            ['name' => 'Politics', 'slug' => 'politics', 'description' => 'Political news and updates'],
            ['name' => 'World', 'slug' => 'world', 'description' => 'International news'],
            ['name' => 'General', 'slug' => 'general', 'description' => 'General news'],
        ];

        foreach ($categories as $category) {
            Category::firstOrCreate(
                ['slug' => $category['slug']],
                $category
            );
        }

        $this->info('Categories seeded successfully!');
    }

    private function seedSources()
    {
        $sources = [
            [
                'name' => 'NewsAPI General',
                'api_name' => 'newsapi',
                'description' => 'General news from NewsAPI.org',
                'language' => 'en',
                'country' => 'us',
                'is_active' => true,
            ],
            [
                'name' => 'NewsData.io',
                'api_name' => 'newsdata',
                'description' => 'News from NewsData.io API',
                'language' => 'en',
                'is_active' => true,
            ],
            [
                'name' => 'The New York Times',
                'api_name' => 'nyt',
                'base_url' => 'https://nytimes.com',
                'description' => 'News from The New York Times',
                'language' => 'en',
                'country' => 'us',
                'is_active' => true,
            ],
        ];

        foreach ($sources as $source) {
            Source::firstOrCreate(
                ['name' => $source['name']],
                $source
            );
        }

        $this->info('Sources seeded successfully!');
    }
}
