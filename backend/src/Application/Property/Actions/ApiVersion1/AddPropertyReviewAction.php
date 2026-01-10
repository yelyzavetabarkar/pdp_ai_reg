<?php

declare(strict_types=1);

namespace Application\Property\Actions\ApiVersion1;

use Domain\Review\Models\Review;

readonly class AddPropertyReviewAction
{
    public function execute(int $propertyId, array $data): array
    {
        $review = new Review();
        $review->property_id = $propertyId;
        $review->user_id = $data['user_id'];
        $review->booking_id = $data['booking_id'];
        $review->rating = $data['rating'];
        $review->comment = $data['comment'];
        $review->save();

        return ['review' => $review, 'success' => true];
    }
}
