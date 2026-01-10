<?php

declare(strict_types=1);

namespace Presentation\ApiVersion1\App\Http\Controllers\Property;

use Presentation\ApiVersion1\App\Http\Controllers\Controller;
use Application\Property\Actions\ApiVersion1\AddPropertyReviewAction;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class AddPropertyReviewController extends Controller
{
    public function __invoke(int $id, Request $request, AddPropertyReviewAction $action): JsonResponse
    {
        $result = $action->execute($id, $request->all());

        return response()->json($result, 201);
    }
}
