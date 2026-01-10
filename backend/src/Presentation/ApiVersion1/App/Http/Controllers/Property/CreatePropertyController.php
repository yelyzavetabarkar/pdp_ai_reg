<?php

declare(strict_types=1);

namespace Presentation\ApiVersion1\App\Http\Controllers\Property;

use Presentation\ApiVersion1\App\Http\Controllers\Controller;
use Application\Property\Actions\ApiVersion1\CreatePropertyAction;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class CreatePropertyController extends Controller
{
    public function __invoke(Request $request, CreatePropertyAction $action): JsonResponse
    {
        $result = $action->execute($request->all());

        return response()->json($result, 201);
    }
}
