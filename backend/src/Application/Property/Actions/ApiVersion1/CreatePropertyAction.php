<?php

declare(strict_types=1);

namespace Application\Property\Actions\ApiVersion1;

use Domain\Property\Models\Property;

readonly class CreatePropertyAction
{
    public function execute(array $data): array
    {
        $property = new Property();
        $property->name = $data['name'];
        $property->description = $data['description'];
        $property->address = $data['address'];
        $property->city = $data['city'];
        $property->price_per_night = $data['price_per_night'];
        $property->max_guests = $data['max_guests'];
        $property->amenities = json_encode($data['amenities'] ?? []);
        $property->save();

        return ['property' => $property, 'success' => true];
    }
}
