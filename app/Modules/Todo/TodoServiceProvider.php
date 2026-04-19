<?php

namespace App\Modules\Todo;

use Illuminate\Support\ServiceProvider;

class TodoServiceProvider extends ServiceProvider
{
    public function register()
    {
        $this->app->bind(
            \App\Modules\Todo\Repositories\Interfaces\TodoRepositoryInterface::class,
            \App\Modules\Todo\Repositories\TodoRepository::class
        );
    }

    public function boot()
    {
        $this->loadRoutesFrom(__DIR__ . '/Routes/api.php');
        $this->loadMigrationsFrom(__DIR__ . '/Database/Migrations');
    }
}
