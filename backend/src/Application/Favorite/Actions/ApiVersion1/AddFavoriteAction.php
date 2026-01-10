<?php

declare(strict_types=1);

namespace Application\Favorite\Actions\ApiVersion1;

use Domain\Favorite\Models\Favorite;

readonly class AddFavoriteAction
{
    public function execute(int $userId, int $propertyId): array
    {
        $favorite = Favorite::firstOrCreate([
            'user_id' => $userId,
            'property_id' => $propertyId,
        ]);

        return ['data' => $favorite];
    }
}
