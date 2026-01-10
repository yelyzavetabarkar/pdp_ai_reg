<?php

declare(strict_types=1);

namespace Presentation\ApiVersion1\App\Http\Controllers\Property;

use Presentation\ApiVersion1\App\Http\Controllers\Controller;
use Application\Property\Actions\ApiVersion1\UpdatePropertyAction;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class UpdatePropertyController extends Controller
{
    public function __invoke(int $id, Request $request, UpdatePropertyAction $action): JsonResponse
    {
        $result = $action->execute($id, $request->all());

        if (!$result) {
            return response()->json(['message' => 'Not found'], 404);
        }

        return response()->json($result);
    }
}
