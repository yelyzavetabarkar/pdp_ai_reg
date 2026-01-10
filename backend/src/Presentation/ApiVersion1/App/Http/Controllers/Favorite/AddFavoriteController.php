<?php

declare(strict_types=1);

namespace Presentation\ApiVersion1\App\Http\Controllers\Favorite;

use Presentation\ApiVersion1\App\Http\Controllers\Controller;
use Presentation\ApiVersion1\App\Http\Requests\Favorite\AddFavoriteRequest;
use Application\Favorite\Actions\ApiVersion1\AddFavoriteAction;
use Illuminate\Http\JsonResponse;

class AddFavoriteController extends Controller
{
    public function __invoke(AddFavoriteRequest $request, AddFavoriteAction $action): JsonResponse
    {
        $result = $action->execute(
            $request->getUserId(),
            $request->getPropertyId()
        );

        return response()->json($result, 201);
    }
}
