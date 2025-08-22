<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Source;
use Illuminate\Support\Facades\DB;

class ResetSourcesCommand extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'sources:reset {--force : Force reset without confirmation}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Reset and reseed the sources table to resolve duplicate key issues';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        if (!$this->option('force')) {
            if (!$this->confirm('This will delete all existing sources and reseed them. Are you sure?')) {
                $this->info('Operation cancelled.');
                return 0;
            }
        }

        $this->info('🔄 Resetting sources table...');

        try {
            // Disable foreign key checks temporarily
            DB::statement('SET session_replication_role = replica;');

            // Clear the sources table
            Source::truncate();
            $this->info('✅ Sources table cleared');

            // Re-enable foreign key checks
            DB::statement('SET session_replication_role = DEFAULT;');

            // Run the source seeder
            $this->info('🌱 Running source seeder...');
            $this->call('db:seed', ['--class' => 'SourceSeeder']);

            $this->info('✅ Sources table has been reset and reseeded successfully!');
            
            // Show the new sources
            $sources = Source::all(['name', 'slug', 'api_name', 'is_active']);
            $this->table(
                ['Name', 'Slug', 'API Name', 'Active'],
                $sources->map(fn($s) => [$s->name, $s->slug, $s->api_name, $s->is_active ? 'Yes' : 'No'])
            );

            return 0;

        } catch (\Exception $e) {
            $this->error('❌ Error resetting sources: ' . $e->getMessage());
            
            // Re-enable foreign key checks in case of error
            try {
                DB::statement('SET session_replication_role = DEFAULT;');
            } catch (\Exception $e2) {
                $this->warn('Warning: Could not re-enable foreign key checks: ' . $e2->getMessage());
            }
            
            return 1;
        }
    }
}
