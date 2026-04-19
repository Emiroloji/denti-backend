<?php
// app/Models/Todo.php

namespace App\Modules\Todo\Models;

use App\Traits\Tenantable;
use Illuminate\Database\Eloquent\Model;

class Todo extends Model
{
    use Tenantable;

    protected $fillable = [
        'title',
        'description',
        'completed',
        'completed_at',
        'category_id',
        'company_id'
    ];

    protected $casts = [
        'completed' => 'boolean',
        'completed_at' => 'datetime'
    ];

    public function category()
    {
        return $this->belongsTo(\App\Modules\Category\Models\Category::class);
    }
}
