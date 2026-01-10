<?php

declare(strict_types=1);

namespace Application\Favorite\Actions\ApiVersion1;

use Domain\Favorite\Models\Favorite;

readonly class RemoveFavoriteAction
{
    public function execute(int $userId, int $propertyId): array
    {
        Favorite::where('user_id', $userId)
            ->where('property_id', $propertyId)
            ->delete();

        return ['success' => true];
    }
}
