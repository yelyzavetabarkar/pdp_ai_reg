<?php

declare(strict_types=1);

namespace Presentation\ApiVersion1\App\Http\Controllers\Auth;

use Presentation\ApiVersion1\App\Http\Controllers\Controller;
use Presentation\ApiVersion1\App\Http\Requests\Auth\RegisterRequest;
use Application\Auth\Actions\ApiVersion1\RegisterUserAction;
use Illuminate\Http\JsonResponse;

class RegisterController extends Controller
{
    public function __invoke(RegisterRequest $request, RegisterUserAction $action): JsonResponse
    {
        $result = $action->execute($request->validated());

        if (isset($result['status']) && $result['status'] !== 200) {
            return response()->json([
                'success' => $result['success'],
                'error' => $result['error']
            ], $result['status']);
        }

        return response()->json($result);
    }
}
