<?php

namespace App\Traits;

use App\Models\Scopes\TenantScope;
use Illuminate\Support\Facades\Auth;

trait Tenantable
{
    /**
     * Boot the tenantable trait.
     */
    protected static function bootTenantable(): void
    {
        static::addGlobalScope(new TenantScope);

        static::creating(function ($model) {
            if (Auth::check() && !isset($model->company_id)) {
                $model->company_id = Auth::user()->company_id;
            }
        });
    }

    /**
     * Scope a query to only include specific company data.
     */
    public function scopeForCompany($query, $companyId)
    {
        return $query->where('company_id', $companyId);
    }
}
