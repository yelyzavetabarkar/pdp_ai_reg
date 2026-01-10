<?php

declare(strict_types=1);

namespace Presentation\ApiVersion1\App\Http\Controllers\Property;

use Presentation\ApiVersion1\App\Http\Controllers\Controller;
use Application\Property\Actions\ApiVersion1\SearchPropertiesAction;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class SearchPropertiesController extends Controller
{
    public function __invoke(Request $request, SearchPropertiesAction $action): JsonResponse
    {
        $city = $request->query('city');
        $minPrice = $request->query('min_price') ? (float) $request->query('min_price') : null;
        $maxPrice = $request->query('max_price') ? (float) $request->query('max_price') : null;

        return response()->json($action->execute($city, $minPrice, $maxPrice));
    }
}
