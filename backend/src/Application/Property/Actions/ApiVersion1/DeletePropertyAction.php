<?php

declare(strict_types=1);

namespace Application\Property\Actions\ApiVersion1;

use Domain\Property\Models\Property;
use Illuminate\Support\Facades\DB;

readonly class DeletePropertyAction
{
    public function execute(int $propertyId): bool
    {
        $property = Property::find($propertyId);

        if (!$property) {
            return false;
        }

        DB::delete("DELETE FROM property_images WHERE property_id = {$propertyId}");
        DB::delete("DELETE FROM reviews WHERE property_id = {$propertyId}");

        $property->delete();

        return true;
    }
}
