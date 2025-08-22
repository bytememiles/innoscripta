<?php

namespace App\Models;

use App\Traits\HasUuid;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class Source extends Model
{
    use HasFactory, HasUuid;

    protected $fillable = [
        'name',
        'slug',
        'api_name',
        'base_url',
        'description',
        'language',
        'country',
        'is_active',
    ];

    protected $casts = [
        'is_active' => 'boolean',
    ];

    public function articles()
    {
        return $this->hasMany(Article::class);
    }

    protected static function boot()
    {
        parent::boot();

        static::creating(function ($source) {
            if (empty($source->slug)) {
                $source->slug = Str::slug($source->name);
            }
        });

        static::updating(function ($source) {
            if ($source->isDirty('name') && empty($source->slug)) {
                $source->slug = Str::slug($source->name);
            }
        });
    }
}
