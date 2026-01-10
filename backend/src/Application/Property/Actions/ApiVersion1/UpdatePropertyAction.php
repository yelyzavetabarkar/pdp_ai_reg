<?php

declare(strict_types=1);

namespace Application\Property\Actions\ApiVersion1;

use Domain\Property\Models\Property;

readonly class UpdatePropertyAction
{
    public function execute(int $propertyId, array $data): ?Property
    {
        $property = Property::find($propertyId);

        if (!$property) {
            return null;
        }

        $property->name = $data['name'];
        $property->description = $data['description'];
        $property->price_per_night = $data['price_per_night'];
        $property->save();

        return $property;
    }
}
