<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Services\NewsScrapingService;
use App\Models\User;
use App\Models\UserPreference;
use App\Jobs\ScrapeNewsJob;

class ScrapeNewsForUserCommand extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'news:scrape-user 
                            {--user-id= : Specific user ID to scrape news for}
                            {--email= : User email to scrape news for}
                            {--default : Scrape default news for all users}
                            {--force : Force refresh even if cache exists}
                            {--queue : Use queue for background processing}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Scrape news articles for specific users or default preferences';

    private NewsScrapingService $scrapingService;

    public function __construct(NewsScrapingService $scrapingService)
    {
        parent::__construct();
        $this->scrapingService = $scrapingService;
    }

    /**
     * Execute the console command.
     */
    public function handle(): int
    {
        $userId = $this->option('user-id');
        $email = $this->option('email');
        $default = $this->option('default');
        $force = $this->option('force');
        $useQueue = $this->option('queue');

        if ($default) {
            return $this->scrapeDefaultNews($useQueue);
        }

        if ($userId) {
            return $this->scrapeForSpecificUser($userId, $force, $useQueue);
        }

        if ($email) {
            return $this->scrapeForUserByEmail($email, $force, $useQueue);
        }

        $this->error('Please specify either --user-id, --email, or --default option.');
        return 1;
    }

    /**
     * Scrape news for a specific user
     */
    private function scrapeForSpecificUser(string $userId, bool $force, bool $useQueue): int
    {
        $user = User::find($userId);
        
        if (!$user) {
            $this->error("User with ID {$userId} not found.");
            return 1;
        }

        $this->info("Scraping news for user: {$user->name} ({$user->email})");

        if ($useQueue) {
            ScrapeNewsJob::dispatch('user_preferences', [], $user->id);
            $this->info('News scraping job queued successfully.');
            return 0;
        }

        try {
            $articles = $this->scrapingService->scrapeForUser($user->id, $force);
            $this->info("Successfully scraped " . count($articles) . " articles for user {$user->name}");
            return 0;
        } catch (\Exception $e) {
            $this->error("Failed to scrape news for user {$user->name}: " . $e->getMessage());
            return 1;
        }
    }

    /**
     * Scrape news for user by email
     */
    private function scrapeForUserByEmail(string $email, bool $force, bool $useQueue): int
    {
        $user = User::where('email', $email)->first();
        
        if (!$user) {
            $this->error("User with email {$email} not found.");
            return 1;
        }

        return $this->scrapeForSpecificUser($user->id, $force, $useQueue);
    }

    /**
     * Scrape default news for all users
     */
    private function scrapeDefaultNews(bool $useQueue): int
    {
        $this->info('Scraping default news for all users...');

        if ($useQueue) {
            ScrapeNewsJob::dispatch('default');
            $this->info('Default news scraping job queued successfully.');
            return 0;
        }

        try {
            $articles = $this->scrapingService->scrapeForUser(0, true); // 0 indicates default scraping
            $this->info("Successfully scraped " . count($articles) . " default articles");
            return 0;
        } catch (\Exception $e) {
            $this->error("Failed to scrape default news: " . $e->getMessage());
            return 1;
        }
    }
}
