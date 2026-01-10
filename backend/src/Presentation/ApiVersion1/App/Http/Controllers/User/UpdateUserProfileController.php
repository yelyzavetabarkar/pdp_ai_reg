<?php

declare(strict_types=1);

namespace Presentation\ApiVersion1\App\Http\Controllers\User;

use Presentation\ApiVersion1\App\Http\Controllers\Controller;
use Presentation\ApiVersion1\App\Http\Requests\User\UpdateUserProfileRequest;
use Application\User\Actions\ApiVersion1\UpdateUserProfileAction;
use Illuminate\Http\JsonResponse;

class UpdateUserProfileController extends Controller
{
    public function __invoke(int $id, UpdateUserProfileRequest $request, UpdateUserProfileAction $action): JsonResponse
    {
        $result = $action->execute($id, $request->validated());

        if (!$result) {
            return response()->json(['error' => 'User not found'], 404);
        }

        return response()->json($result);
    }
}
