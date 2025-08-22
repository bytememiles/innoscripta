<?php

namespace App\Models;

use App\Traits\HasUuid;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Article extends Model
{
    use HasFactory, HasUuid;

    protected $fillable = [
        'title',
        'description',
        'content',
        'url',
        'url_to_image',
        'published_at',
        'author',
        'source_id',
        'category_id',
        'language',
        'country',
        'external_id',
        'metadata',
    ];

    protected $casts = [
        'published_at' => 'datetime',
        'metadata' => 'array',
    ];

    public function source()
    {
        return $this->belongsTo(Source::class);
    }

    public function category()
    {
        return $this->belongsTo(Category::class);
    }

    public function scopeByDateRange($query, $startDate, $endDate)
    {
        return $query->whereBetween('published_at', [$startDate, $endDate]);
    }

    public function scopeBySource($query, $sourceIds)
    {
        return $query->whereIn('source_id', (array) $sourceIds);
    }

    public function scopeByCategory($query, $categoryIds)
    {
        return $query->whereIn('category_id', (array) $categoryIds);
    }

    public function scopeSearch($query, $searchTerm)
    {
        return $query->whereFullText(['title', 'description', 'content'], $searchTerm);
    }
}
