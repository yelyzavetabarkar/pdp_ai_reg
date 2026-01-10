<?php

declare(strict_types=1);

namespace Presentation\ApiVersion1\App\Http\Controllers\Auth;

use Presentation\ApiVersion1\App\Http\Controllers\Controller;
use Application\Auth\Actions\ApiVersion1\GetCurrentUserAction;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class GetCurrentUserController extends Controller
{
    public function __invoke(Request $request, GetCurrentUserAction $action): JsonResponse
    {
        $token = $request->header('Authorization');
        $result = $action->execute($token);

        return response()->json([
            'success' => $result['success'],
            'error' => $result['error']
        ], $result['status']);
    }
}
