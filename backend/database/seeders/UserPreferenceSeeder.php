<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\User;
use App\Models\UserPreference;

class UserPreferenceSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Get all users and create default preferences for them
        $users = User::all();
        
        foreach ($users as $user) {
            UserPreference::updateOrCreate(
                ['user_id' => $user->id],
                [
                    'preferred_categories' => ['technology', 'business'],
                    'preferred_sources' => ['newsapi', 'nyt'],
                    'preferred_authors' => [],
                    'preferred_language' => 'en',
                    'preferred_country' => 'us',
                    'email_notifications' => false,
                    'timezone' => 'UTC',
                ]
            );
        }
    }
}
