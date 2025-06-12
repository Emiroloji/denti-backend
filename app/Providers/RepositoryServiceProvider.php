<?php
// app/Providers/RepositoryServiceProvider.php - GÜNCELLENMİŞ HALİ

namespace App\Providers;

use Illuminate\Support\ServiceProvider;

// Todo Repository
use App\Repositories\Interfaces\TodoRepositoryInterface;
use App\Repositories\TodoRepository;

// Category Repository - YENİ EKLENEN!
use App\Repositories\Interfaces\CategoryRepositoryInterface;
use App\Repositories\CategoryRepository;

class RepositoryServiceProvider extends ServiceProvider
{
    /**
     * Register services.
     */
    public function register()
    {
        // Todo Repository Binding
        $this->app->bind(
            TodoRepositoryInterface::class,
            TodoRepository::class
        );

        // Category Repository Binding - YENİ EKLENEN!
        $this->app->bind(
            CategoryRepositoryInterface::class,
            CategoryRepository::class
        );
    }

    /**
     * Bootstrap services.
     */
    public function boot()
    {
        //
    }
}