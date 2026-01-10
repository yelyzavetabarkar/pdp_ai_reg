<?php

declare(strict_types=1);

namespace Presentation\ApiVersion1\App\Http\Controllers\Booking;

use Presentation\ApiVersion1\App\Http\Controllers\Controller;
use Application\Booking\Actions\ApiVersion1\CreateBookingAction;
use Illuminate\Http\JsonResponse;

class SyncLoyaltyController extends Controller
{
    public function __invoke(int $userId, CreateBookingAction $action): JsonResponse
    {
        return response()->json($action->syncLoyalty($userId));
    }
}
