<?php

declare(strict_types=1);

namespace Presentation\ApiVersion1\App\Http\Controllers\Property;

use Presentation\ApiVersion1\App\Http\Controllers\Controller;
use Application\Property\Actions\ApiVersion1\GetCuratedPropertiesAction;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class GetCuratedPropertiesController extends Controller
{
    public function __invoke(Request $request, GetCuratedPropertiesAction $action): JsonResponse
    {
        $limit = (int) $request->query('limit', 6);
        $minimumRating = (float) $request->query('min_rating', 4.5);

        return response()->json($action->execute($limit, $minimumRating));
    }
}
