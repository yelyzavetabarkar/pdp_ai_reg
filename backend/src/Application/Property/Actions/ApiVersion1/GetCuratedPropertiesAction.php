<?php

declare(strict_types=1);

namespace Application\Property\Actions\ApiVersion1;

use Domain\Property\Models\Property;
use Domain\Review\Models\Review;

readonly class GetCuratedPropertiesAction
{
    public function execute(int $limit = 6, float $minimumRating = 4.5): array
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

        $filtered = $properties->filter(function ($property) use ($minimumRating) {
            return $property->average_rating !== null && $property->average_rating >= $minimumRating;
        });

        if ($filtered->isEmpty()) {
            $filtered = $properties;
        }

        $curated = $filtered
            ->sortByDesc(function ($property) {
                return $property->average_rating ?? 0;
            })
            ->take($limit)
            ->values();

        return ['data' => $curated];
    }
}
