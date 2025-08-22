<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\Source;

class SourceSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $sources = [
            [
                'name' => 'NewsAPI',
                'api_name' => 'newsapi',
                'description' => 'NewsAPI provides news articles from various sources',
                'base_url' => 'https://newsapi.org',
                'language' => 'en',
                'country' => 'us',
            ],
            [
                'name' => 'NewsData.io',
                'api_name' => 'newsdata',
                'description' => 'NewsData.io provides news from multiple countries and languages',
                'base_url' => 'https://newsdata.io',
                'language' => 'en',
                'country' => 'us',
            ],
            [
                'name' => 'New York Times',
                'api_name' => 'nyt',
                'description' => 'The New York Times is an American daily newspaper',
                'base_url' => 'https://www.nytimes.com',
                'language' => 'en',
                'country' => 'us',
            ],
            [
                'name' => 'BBC News',
                'api_name' => 'bbc',
                'description' => 'BBC News is the operational business division of the BBC',
                'base_url' => 'https://www.bbc.com/news',
                'language' => 'en',
                'country' => 'gb',
            ],
            [
                'name' => 'Reuters',
                'api_name' => 'reuters',
                'description' => 'Reuters is a British news agency',
                'base_url' => 'https://www.reuters.com',
                'language' => 'en',
                'country' => 'gb',
            ],
        ];

        foreach ($sources as $source) {
            Source::updateOrCreate(
                ['api_name' => $source['api_name']],
                [
                    'name' => $source['name'],
                    'description' => $source['description'],
                    'base_url' => $source['base_url'],
                    'language' => $source['language'],
                    'country' => $source['country'],
                    'is_active' => true,
                ]
            );
        }
    }
}
