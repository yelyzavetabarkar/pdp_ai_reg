<?php

declare(strict_types=1);

namespace Application\Property\Actions\ApiVersion1;

use Domain\Property\Models\Property;
use Domain\Review\Models\Review;

readonly class GetAllPropertiesAction
{
    public function execute()
    {
        $properties = Property::all();

        foreach ($properties as $property) {
            $reviews = Review::where('property_id', $property->id)->get();
            $property->review_count = count($reviews);
            $total = 0;
            foreach ($reviews as $review) {
                $total += $review->rating;
            }
            $property->average_rating = count($reviews) > 0 ? round($total / count($reviews), 1) : null;
        }

        return $properties;
    }
}
