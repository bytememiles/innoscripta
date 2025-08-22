<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ScrapingJob extends Model
{
    use HasUuids;

    protected $fillable = [
        'id',
        'type',
        'status',
        'filters',
        'user_id',
        'progress',
        'error_message',
        'started_at',
        'completed_at',
        'failed_at',
        'cancelled_at',
    ];

    protected $casts = [
        'filters' => 'array',
        'started_at' => 'datetime',
        'completed_at' => 'datetime',
        'failed_at' => 'datetime',
        'cancelled_at' => 'datetime',
    ];

    /**
     * Get the user that owns the job
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Scope for active jobs
     */
    public function scopeActive($query)
    {
        return $query->whereIn('status', ['queued', 'started', 'in_progress']);
    }

    /**
     * Scope for completed jobs
     */
    public function scopeCompleted($query)
    {
        return $query->whereIn('status', ['completed', 'failed', 'cancelled']);
    }

    /**
     * Get status color for UI
     */
    public function getStatusColorAttribute(): string
    {
        return match($this->status) {
            'queued' => 'default',
            'started' => 'info',
            'in_progress' => 'primary',
            'completed' => 'success',
            'failed' => 'error',
            'cancelled' => 'warning',
            default => 'default',
        };
    }

    /**
     * Get status text for UI
     */
    public function getStatusTextAttribute(): string
    {
        return match($this->status) {
            'queued' => 'Queued',
            'started' => 'Started',
            'in_progress' => 'In Progress',
            'completed' => 'Completed',
            'failed' => 'Failed',
            'cancelled' => 'Cancelled',
            default => $this->status,
        };
    }
}
