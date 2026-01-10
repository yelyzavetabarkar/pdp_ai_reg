<?php

declare(strict_types=1);

namespace Presentation\ApiVersion1\App\Http\Controllers\Favorite;

use Presentation\ApiVersion1\App\Http\Controllers\Controller;
use Presentation\ApiVersion1\App\Http\Requests\Favorite\RemoveFavoriteRequest;
use Application\Favorite\Actions\ApiVersion1\RemoveFavoriteAction;
use Illuminate\Http\JsonResponse;

class RemoveFavoriteController extends Controller
{
    public function __invoke(RemoveFavoriteRequest $request, RemoveFavoriteAction $action): JsonResponse
    {
        $result = $action->execute(
            $request->getUserId(),
            $request->getPropertyId()
        );

        return response()->json($result);
    }
}
