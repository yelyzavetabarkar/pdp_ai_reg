<?php

declare(strict_types=1);

namespace Presentation\ApiVersion1\App\Http\Controllers\Booking;

use Presentation\ApiVersion1\App\Http\Controllers\Controller;
use Application\Booking\Actions\ApiVersion1\GetBookingsByUserAction;
use Illuminate\Http\JsonResponse;

class GetBookingsByUserController extends Controller
{
    public function __invoke(int $userId, GetBookingsByUserAction $action): JsonResponse
    {
        return response()->json($action->execute($userId));
    }
}
