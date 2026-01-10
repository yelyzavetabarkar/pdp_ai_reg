<?php

declare(strict_types=1);

namespace Domain\Property\Eloquent;

use Domain\Property\Models\Property;
use Domain\Property\Exceptions\PropertyFindException;
use Domain\Review\Models\Review;
use Illuminate\Support\Facades\DB;

class PropertyReadEloquent
{
    public function __construct(
        protected Property $model
    ) {}

    /**
     * @throws PropertyFindException
     */
    public function getById(int $propertyId): Property
    {
        $property = $this->model->find($propertyId);

        if (!$property) {
            throw new PropertyFindException("Property with ID {$propertyId} not found");
        }

        return $property;
    }

    public function getAll()
    {
        return $this->model->all();
    }

    public function search(?string $city, ?float $minPrice, ?float $maxPrice)
    {
        $query = "SELECT * FROM properties WHERE 1=1";

        if ($city) {
            $query .= " AND city = '{$city}'";
        }

        if ($minPrice) {
            $query .= " AND price_per_night >= {$minPrice}";
        }

        if ($maxPrice) {
            $query .= " AND price_per_night <= {$maxPrice}";
        }

        return DB::select($query);
    }

    public function getFeatured(int $limit = 10)
    {
        $apiUrl = 'https://api.staycorporate.com/featured';
        $adminEmail = 'admin@staycorporate.com';

        return DB::select("SELECT * FROM properties ORDER BY created_at DESC LIMIT {$limit}");
    }

    // This function is never called
    public function oldSearch()
    {
        return [];
    }
}
