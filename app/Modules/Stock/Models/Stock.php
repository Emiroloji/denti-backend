<?php
// app/Modules/Stock/Models/Stock.php

namespace App\Modules\Stock\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Stock extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'name', 'code', 'description', 'unit', 'category', 'brand',
        'supplier_id', 'purchase_price', 'currency', 'purchase_date', 'expiry_date',
        'current_stock', 'reserved_stock', 'available_stock',
        'min_stock_level', 'critical_stock_level',
        'yellow_alert_level', 'red_alert_level',
        'internal_usage_count', 'status', 'is_active', 'track_expiry', 'track_batch',
        'clinic_id', 'storage_location'
    ];

    protected $casts = [
        'purchase_date' => 'date',
        'expiry_date' => 'date',
        'purchase_price' => 'decimal:2',
        'track_expiry' => 'boolean',
        'track_batch' => 'boolean',
        'is_active' => 'boolean',
    ];

    protected $attributes = [
        'is_active' => true,
        'status' => 'active',
        'track_expiry' => true,
        'track_batch' => false,
        'currency' => 'TRY',
        'current_stock' => 0,
        'reserved_stock' => 0,
        'available_stock' => 0,
        'internal_usage_count' => 0,
    ];

    // İlişkiler
    public function supplier(): BelongsTo
    {
        return $this->belongsTo(\App\Modules\Stock\Models\Supplier::class);
    }

    public function clinic(): BelongsTo
    {
        return $this->belongsTo(\App\Modules\Stock\Models\Clinic::class);
    }

    public function transactions(): HasMany
    {
        return $this->hasMany(\App\Modules\Stock\Models\StockTransaction::class);
    }

    public function requests(): HasMany
    {
        return $this->hasMany(\App\Modules\Stock\Models\StockRequest::class);
    }

    public function alerts(): HasMany
    {
        return $this->hasMany(\App\Modules\Stock\Models\StockAlert::class);
    }

    // Scope'lar
    public function scopeActive($query)
    {
        return $query->where('is_active', true)
                    ->where('status', '!=', 'deleted');
    }

    public function scopeInactive($query)
    {
        return $query->where('is_active', false)
                    ->where('status', '!=', 'deleted');
    }

    public function scopeDeleted($query)
    {
        return $query->where('status', 'deleted');
    }

    public function scopeLowStock($query)
    {
        return $query->whereRaw('current_stock <= yellow_alert_level')
                    ->where('is_active', true);
    }

    public function scopeCriticalStock($query)
    {
        return $query->whereRaw('current_stock <= red_alert_level')
                    ->where('is_active', true);
    }

    public function scopeNearExpiry($query, $days = 30)
    {
        return $query->where('track_expiry', true)
                    ->where('expiry_date', '<=', now()->addDays($days))
                    ->where('expiry_date', '>', now())
                    ->where('is_active', true);
    }

    public function scopeExpired($query)
    {
        return $query->where('track_expiry', true)
                    ->where('expiry_date', '<', now())
                    ->where('is_active', true);
    }

    // Accessor'lar
    public function getStockStatusAttribute()
    {
        if ($this->status === 'deleted') return 'deleted';
        if (!$this->is_active) return 'inactive';
        if ($this->current_stock <= $this->red_alert_level) return 'critical';
        if ($this->current_stock <= $this->yellow_alert_level) return 'low';
        return 'normal';
    }

    public function getIsDeletedAttribute()
    {
        return $this->status === 'deleted' || $this->deleted_at !== null;
    }

    public function getIsExpiredAttribute()
    {
        return $this->track_expiry && $this->expiry_date < now();
    }

    public function getIsNearExpiryAttribute()
    {
        return $this->track_expiry &&
               $this->expiry_date <= now()->addDays(30) &&
               $this->expiry_date > now();
    }

    public function getDaysToExpiryAttribute()
    {
        if (!$this->track_expiry || !$this->expiry_date) return null;
        return now()->diffInDays($this->expiry_date, false);
    }

    // Model Events
    protected static function boot()
    {
        parent::boot();

        static::creating(function ($stock) {
            if (!isset($stock->is_active)) {
                $stock->is_active = true;
            }
            if (!isset($stock->status)) {
                $stock->status = $stock->is_active ? 'active' : 'inactive';
            }
            if (!isset($stock->available_stock)) {
                $stock->available_stock = $stock->current_stock - ($stock->reserved_stock ?? 0);
            }
        });

        static::updating(function ($stock) {
            if ($stock->isDirty('is_active')) {
                $stock->status = $stock->is_active ? 'active' : 'inactive';
            }

            if ($stock->isDirty(['current_stock', 'reserved_stock'])) {
                $stock->available_stock = $stock->current_stock - ($stock->reserved_stock ?? 0);
            }
        });
    }
}