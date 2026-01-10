<?php

declare(strict_types=1);

namespace Infrastructure\Providers;

use Illuminate\Database\Eloquent\Relations\Relation;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        //
    }

    public function boot(): void
    {
        $this->loadMigrationsFrom(__DIR__ . '/../Database/Migrations');

        Relation::enforceMorphMap([
            'user' => \Domain\User\Models\User::class,
            'property' => \Domain\Property\Models\Property::class,
            'booking' => \Domain\Booking\Models\Booking::class,
            'review' => \Domain\Review\Models\Review::class,
        ]);
    }
}
