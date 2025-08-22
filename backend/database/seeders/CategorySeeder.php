<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\Category;

class CategorySeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $categories = [
            [
                'name' => 'Technology',
                'slug' => 'technology',
                'description' => 'Technology and innovation news',
                'is_active' => true,
            ],
            [
                'name' => 'Business',
                'slug' => 'business',
                'description' => 'Business and economy news',
                'is_active' => true,
            ],
            [
                'name' => 'Politics',
                'slug' => 'politics',
                'description' => 'Political news and analysis',
                'is_active' => true,
            ],
            [
                'name' => 'Health',
                'slug' => 'health',
                'description' => 'Health and medical news',
                'is_active' => true,
            ],
            [
                'name' => 'Science',
                'slug' => 'science',
                'description' => 'Scientific discoveries and research',
                'is_active' => true,
            ],
            [
                'name' => 'Sports',
                'slug' => 'sports',
                'description' => 'Sports news and updates',
                'is_active' => true,
            ],
            [
                'name' => 'Entertainment',
                'slug' => 'entertainment',
                'description' => 'Entertainment and celebrity news',
                'is_active' => true,
            ],
            [
                'name' => 'World',
                'slug' => 'world',
                'description' => 'International news and events',
                'is_active' => true,
            ],
        ];

        foreach ($categories as $category) {
            Category::updateOrCreate(
                ['slug' => $category['slug']],
                $category
            );
        }
    }
}
