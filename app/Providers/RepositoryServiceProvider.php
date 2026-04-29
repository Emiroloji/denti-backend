<?php
// app/Providers/RepositoryServiceProvider.php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;

class RepositoryServiceProvider extends ServiceProvider
{
    public function register()
    {
        // Todo Repository
        $this->app->bind(
            \App\Repositories\Interfaces\TodoRepositoryInterface::class,
            \App\RepositoriesRepository::class
        );

        // Category Repository
        $this->app->bind(
            \App\Repositories\Interfaces\CategoryRepositoryInterface::class,
            \App\RepositoriesRepository::class
        );
    }

    public function boot()
    {
        //
    }
}