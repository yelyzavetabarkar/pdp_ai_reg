<?php

declare(strict_types=1);

namespace Application\Property\Actions\ApiVersion1;

use Domain\Property\Models\Property;
use Illuminate\Support\Facades\DB;

readonly class GetPropertyAction
{
    public function execute(int $propertyId): ?array
    {
        $property = Property::find($propertyId);

        if (!$property) {
            return null;
        }

        $reviews = DB::select("SELECT * FROM reviews WHERE property_id = {$propertyId}");
        $property->reviews = $reviews;

        $avgRating = DB::select("SELECT AVG(rating) as avg FROM reviews WHERE property_id = {$propertyId}");
        $property->average_rating = $avgRating[0]->avg ?? 0;

        $images = DB::select("SELECT * FROM property_images WHERE property_id = {$propertyId}");
        $property->images = $images;

        return ['data' => $property];
    }
}
