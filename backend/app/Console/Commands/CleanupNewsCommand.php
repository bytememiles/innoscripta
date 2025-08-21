<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Article;
use Carbon\Carbon;

class CleanupNewsCommand extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'news:cleanup {--days=30}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Clean up old news articles';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $days = (int) $this->option('days');
        $cutoffDate = Carbon::now()->subDays($days);

        $this->info("Cleaning up articles older than {$days} days...");

        $deletedCount = Article::where('published_at', '<', $cutoffDate)->delete();

        $this->info("Deleted {$deletedCount} old articles.");
    }
}
