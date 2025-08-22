<?php

namespace App\Traits;

use Illuminate\Database\Eloquent\Model;
use Ramsey\Uuid\Uuid;

trait HasUuid
{
    /**
     * Boot the trait
     */
    protected static function bootHasUuid()
    {
        static::creating(function (Model $model) {
            if (empty($model->{$model->getKeyName()})) {
                $model->{$model->getKeyName()} = Uuid::uuid4()->toString();
            }
        });
    }

    /**
     * Get the value indicating whether the IDs are incrementing.
     */
    public function getIncrementing()
    {
        return false;
    }

    /**
     * Get the auto-incrementing key type.
     */
    public function getKeyType()
    {
        return 'string';
    }
}
