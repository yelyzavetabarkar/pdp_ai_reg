<?php

declare(strict_types=1);

namespace Presentation\ApiVersion1\App\Http\Controllers\User;

use Presentation\ApiVersion1\App\Http\Controllers\Controller;
use Application\User\Actions\ApiVersion1\GetUserAction;
use Illuminate\Http\JsonResponse;

class GetUserController extends Controller
{
    public function __invoke(int $id, GetUserAction $action): JsonResponse
    {
        $user = $action->execute($id);

        if (!$user) {
            return response()->json(['error' => 'User not found'], 404);
        }

        return response()->json($user);
    }
}
