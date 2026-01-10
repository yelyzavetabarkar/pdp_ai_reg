<?php

declare(strict_types=1);

namespace Presentation\ApiVersion1\App\Http\Controllers\Favorite;

use Presentation\ApiVersion1\App\Http\Controllers\Controller;
use Application\Favorite\Actions\ApiVersion1\GetUserFavoritesAction;
use Illuminate\Http\JsonResponse;

class GetUserFavoritesController extends Controller
{
    public function __invoke(int $userId, GetUserFavoritesAction $action): JsonResponse
    {
        return response()->json($action->execute($userId));
    }
}
