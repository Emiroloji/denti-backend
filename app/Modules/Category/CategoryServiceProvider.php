<?php

namespace App\Modules\Category;

use Illuminate\Support\ServiceProvider;

class CategoryServiceProvider extends ServiceProvider
{
    public function register()
    {
        $this->app->bind(
            \App\Modules\Category\Repositories\Interfaces\CategoryRepositoryInterface::class,
            \App\Modules\Category\Repositories\CategoryRepository::class
        );
    }

    public function boot()
    {
        $this->loadRoutesFrom(__DIR__ . '/Routes/api.php');
        $this->loadMigrationsFrom(__DIR__ . '/Database/Migrations');
    }
}
