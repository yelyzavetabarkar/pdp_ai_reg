<?php

declare(strict_types=1);

namespace Presentation\ApiVersion1\App\Http\Controllers\User;

use Presentation\ApiVersion1\App\Http\Controllers\Controller;
use Application\User\Actions\ApiVersion1\GetUserBookingsAction;
use Illuminate\Http\JsonResponse;

class GetUserBookingsController extends Controller
{
    public function __invoke(int $id, GetUserBookingsAction $action)
    {
        $result = $action->execute($id);

        if ($result === null) {
            return response()->json(['error' => 'User not found'], 404);
        }

        return $result;
    }
}
