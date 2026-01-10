<?php

declare(strict_types=1);

namespace Presentation\ApiVersion1\App\Http\Controllers\Auth;

use Presentation\ApiVersion1\App\Http\Controllers\Controller;
use Presentation\ApiVersion1\App\Http\Requests\Auth\LoginRequest;
use Application\Auth\Actions\ApiVersion1\LoginUserAction;
use Illuminate\Http\JsonResponse;

class LoginController extends Controller
{
    public function __invoke(LoginRequest $request, LoginUserAction $action): JsonResponse
    {
        $result = $action->execute(
            $request->getEmail(),
            $request->getPassword()
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
