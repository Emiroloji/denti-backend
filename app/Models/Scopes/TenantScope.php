<?php

namespace App\Models\Scopes;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Scope;
use Illuminate\Support\Facades\Auth;

class TenantScope implements Scope
{
    /**
     * Apply the scope to a given Eloquent query builder.
     */
    public function apply(Builder $builder, Model $model): void
    {
        // User modeli için global scope'u devre dışı bırakıyoruz 
        // çünkü Sanctum user'ı çekerken bu scope sonsuz döngüye giriyor.
        if ($model instanceof \App\Models\User) {
            return;
        }

        if (Auth::check()) {
            $user = Auth::user();
            
            // 🔄 ÖNEMLİ: hasRole() veya $user->roles kullanımı içeride tekrar Role modelini sorguladığı için 
            // ve Role modeli de Tenantable olduğu için sonsuz döngüye (recursion) giriyordu.
            // Bu yüzden DB üzerinden doğrudan (raw) kontrol yaparak bu döngüyü kırıyoruz.
            $isSuperAdmin = \DB::table('model_has_roles')
                ->join('roles', 'model_has_roles.role_id', '=', 'roles.id')
                ->where('model_has_roles.model_id', $user->id)
                ->where('model_has_roles.model_type', \App\Models\User::class)
                ->where('roles.name', 'Super Admin')
                ->exists();

            if ($isSuperAdmin) {
                return;
            }

            $builder->where(function ($query) use ($user, $model) {
                $query->where($model->getTable() . '.company_id', $user->company_id)
                      ->orWhereNull($model->getTable() . '.company_id');
            });
        }
    }
}
