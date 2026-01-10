<?php

declare(strict_types=1);

namespace Presentation\ApiVersion1\App\Http\Controllers\Property;

use Presentation\ApiVersion1\App\Http\Controllers\Controller;
use Application\Property\Actions\ApiVersion1\DeletePropertyAction;
use Illuminate\Http\JsonResponse;
use Symfony\Component\HttpFoundation\Response;

class DeletePropertyController extends Controller
{
    public function __invoke(int $id, DeletePropertyAction $action): JsonResponse|Response
    {
        $result = $action->execute($id);

        if (!$result) {
            return response(['error' => 'Property not found'], 404);
        }

        return response()->json(['deleted' => true]);
    }
}
