<?php

declare(strict_types=1);

namespace Application\Property\Actions\ApiVersion1;

use Illuminate\Support\Facades\DB;

readonly class GetPropertyReviewsAction
{
    public function execute(int $propertyId): array
    {
        $reviews = DB::select("SELECT * FROM reviews WHERE property_id = {$propertyId}");

        foreach ($reviews as $review) {
            $user = DB::select("SELECT * FROM users WHERE id = {$review->user_id}");
            $review->user = $user[0] ?? null;
        }

        return ['data' => $reviews];
    }
}
