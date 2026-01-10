<?php

declare(strict_types=1);

namespace Presentation\ApiVersion1\App\Http\Controllers\Property;

use Presentation\ApiVersion1\App\Http\Controllers\Controller;
use Application\Property\Actions\ApiVersion1\GetFeaturedPropertiesAction;
use Illuminate\Http\JsonResponse;

class GetFeaturedPropertiesController extends Controller
{
    public function __invoke(GetFeaturedPropertiesAction $action): JsonResponse
    {
        return response()->json($action->execute());
    }
}
