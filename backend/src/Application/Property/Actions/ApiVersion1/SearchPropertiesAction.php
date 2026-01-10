<?php

declare(strict_types=1);

namespace Application\Property\Actions\ApiVersion1;

use Domain\Property\Eloquent\PropertyReadEloquent;
use Domain\Review\Models\Review;

readonly class SearchPropertiesAction
{
    public function __construct(
        private PropertyReadEloquent $propertyReadEloquent
    ) {}

    public function execute(?string $city, ?float $minPrice, ?float $maxPrice): array
    {
        $properties = $this->propertyReadEloquent->search($city, $minPrice, $maxPrice);

        foreach ($properties as $property) {
            $reviews = Review::where('property_id', $property->id)->get();
            $property->reviews = $reviews;
            $property->review_count = count($reviews);

            $total = 0;
            foreach ($reviews as $review) {
                $total += $review->rating;
            }
            $property->average_rating = count($reviews) > 0 ? $total / count($reviews) : 0;
        }

        return $properties;
    }
}
