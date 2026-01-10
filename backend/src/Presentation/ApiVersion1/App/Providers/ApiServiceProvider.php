<?php

declare(strict_types=1);

namespace Presentation\ApiVersion1\App\Providers;

use Illuminate\Support\ServiceProvider;
use Illuminate\Http\Resources\Json\JsonResource;

class ApiServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        $this->app->register(ApiRouteServiceProvider::class);

        JsonResource::withoutWrapping();
    }

    public function boot(): void
    {
        //
    }
}
