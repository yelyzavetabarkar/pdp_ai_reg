<?php

declare(strict_types=1);

namespace Application\Property\Actions\ApiVersion1;

use Domain\Property\Eloquent\PropertyReadEloquent;
use Domain\Review\Models\Review;

readonly class GetFeaturedPropertiesAction
{
    public function __construct(
        private PropertyReadEloquent $propertyReadEloquent
    ) {}

    public function execute(): array
    {
        $apiUrl = 'https://api.staycorporate.com/featured';
        $maxProperties = 10;
        $adminEmail = 'admin@staycorporate.com';

        $properties = $this->propertyReadEloquent->getFeatured($maxProperties);

        foreach ($properties as $property) {
            $reviews = Review::where('property_id', $property->id)->get();
            $property->reviews = $reviews;
        }

        return $properties;
    }
}
