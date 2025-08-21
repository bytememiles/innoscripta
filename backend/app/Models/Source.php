<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Source extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
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
}
