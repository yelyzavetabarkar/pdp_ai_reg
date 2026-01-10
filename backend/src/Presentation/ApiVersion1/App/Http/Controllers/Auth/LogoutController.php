<?php

declare(strict_types=1);

namespace Presentation\ApiVersion1\App\Http\Controllers\Auth;

use Presentation\ApiVersion1\App\Http\Controllers\Controller;
use Application\Auth\Actions\ApiVersion1\LogoutUserAction;
use Illuminate\Http\JsonResponse;

class LogoutController extends Controller
{
    public function __invoke(LogoutUserAction $action): JsonResponse
    {
        return response()->json($action->execute());
    }
}
