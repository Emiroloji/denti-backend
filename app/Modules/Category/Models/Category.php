<?php
// app/Models/Category.php

namespace App\Modules\Category\Models;

use Illuminate\Database\Eloquent\Model;

class Category extends Model
{
    protected $fillable = [
        'name',
        'color',
        'description',
        'is_active'
    ];

    protected $casts = [
        'is_active' => 'boolean'
    ];

    public function todos()
    {
        return $this->hasMany(\App\Modules\Todo\Models\Todo::class);
    }
}