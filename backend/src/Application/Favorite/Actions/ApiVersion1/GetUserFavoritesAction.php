<?php

declare(strict_types=1);

namespace Application\Favorite\Actions\ApiVersion1;

use Domain\Favorite\Models\Favorite;

readonly class GetUserFavoritesAction
{
    public function execute(int $userId): array
    {
        $favorites = Favorite::with('property')
            ->where('user_id', $userId)
            ->get();

        return ['data' => $favorites];
    }
}
