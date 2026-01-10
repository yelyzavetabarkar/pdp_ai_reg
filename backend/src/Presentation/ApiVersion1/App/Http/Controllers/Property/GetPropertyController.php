<?php

declare(strict_types=1);

namespace Presentation\ApiVersion1\App\Http\Controllers\Property;

use Presentation\ApiVersion1\App\Http\Controllers\Controller;
use Application\Property\Actions\ApiVersion1\GetPropertyAction;
use Illuminate\Http\JsonResponse;

class GetPropertyController extends Controller
{
    public function __invoke(int $id, GetPropertyAction $action): JsonResponse
    {
        $result = $action->execute($id);

        if (!$result) {
            return response()->json(['error' => 'Not found'], 404);
        }

        return response()->json($result);
    }
}
