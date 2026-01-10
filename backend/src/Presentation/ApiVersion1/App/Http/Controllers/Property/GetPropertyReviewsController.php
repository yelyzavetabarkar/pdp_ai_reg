<?php

declare(strict_types=1);

namespace Presentation\ApiVersion1\App\Http\Controllers\Property;

use Presentation\ApiVersion1\App\Http\Controllers\Controller;
use Application\Property\Actions\ApiVersion1\GetPropertyReviewsAction;
use Illuminate\Http\JsonResponse;

class GetPropertyReviewsController extends Controller
{
    public function __invoke(int $id, GetPropertyReviewsAction $action): JsonResponse
    {
        return response()->json($action->execute($id));
    }
}
