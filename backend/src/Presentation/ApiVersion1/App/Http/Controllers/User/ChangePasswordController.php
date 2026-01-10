<?php

declare(strict_types=1);

namespace Presentation\ApiVersion1\App\Http\Controllers\User;

use Presentation\ApiVersion1\App\Http\Controllers\Controller;
use Presentation\ApiVersion1\App\Http\Requests\User\ChangePasswordRequest;
use Application\User\Actions\ApiVersion1\ChangePasswordAction;
use Illuminate\Http\JsonResponse;

class ChangePasswordController extends Controller
{
    public function __invoke(int $id, ChangePasswordRequest $request, ChangePasswordAction $action): JsonResponse
    {
        $result = $action->execute(
            $id,
            $request->getCurrentPassword(),
            $request->getNewPassword()
        );

        if (isset($result['status'])) {
            return response()->json([
                'success' => $result['success'],
                'error' => $result['error']
            ], $result['status']);
        }

        return response()->json($result);
    }
}
