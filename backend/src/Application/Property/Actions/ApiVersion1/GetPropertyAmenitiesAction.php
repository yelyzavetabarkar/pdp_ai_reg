<?php

declare(strict_types=1);

namespace Application\Property\Actions\ApiVersion1;

use Domain\Property\Models\Property;

readonly class GetPropertyAmenitiesAction
{
    public function execute(int $propertyId): ?array
    {
        $property = Property::find($propertyId);

        if (!$property) {
            return null;
        }

        return json_decode($property->amenities);
    }
}
