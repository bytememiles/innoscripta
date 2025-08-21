<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\Mail;
use Illuminate\Mail\Message;
use App\Mail\WelcomeEmail;
use App\Models\User;

class TestEmailCommand extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'email:test {--to=martin.eesmaa@gmail.com} {--type=simple}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Test email configuration by sending a test email';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $to = $this->option('to');
        $type = $this->option('type');
        
        $this->info("Sending {$type} test email to: {$to}");

        try {
            if ($type === 'welcome') {
                // Create a test user for the welcome email
                $testUser = new User([
                    'name' => 'Test User',
                    'email' => $to,
                ]);
                
                Mail::to($to)->send(new WelcomeEmail($testUser));
                $this->info('✅ Welcome email sent successfully!');
            } else {
                // Send simple test email
                Mail::raw('This is a test email from your News Aggregator Laravel backend. If you receive this, your SMTP configuration is working correctly!', function (Message $message) use ($to) {
                    $message->to($to)
                            ->subject('Test Email - News Aggregator Backend');
                });
                $this->info('✅ Simple test email sent successfully!');
            }
            
            $this->info('Check your inbox for the test email.');
            
        } catch (\Exception $e) {
            $this->error('❌ Failed to send test email:');
            $this->error($e->getMessage());
            
            // Show current mail configuration for debugging
            $this->info('Current mail configuration:');
            $this->line('MAIL_MAILER: ' . config('mail.default'));
            $this->line('MAIL_HOST: ' . config('mail.mailers.smtp.host'));
            $this->line('MAIL_PORT: ' . config('mail.mailers.smtp.port'));
            $this->line('MAIL_USERNAME: ' . config('mail.mailers.smtp.username'));
            $this->line('MAIL_ENCRYPTION: ' . config('mail.mailers.smtp.encryption'));
            $this->line('MAIL_FROM_ADDRESS: ' . config('mail.from.address'));
        }
    }
}
