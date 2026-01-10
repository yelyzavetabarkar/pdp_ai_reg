<?php

declare(strict_types=1);

namespace Presentation\ApiVersion1\App\Http\Controllers\Booking;

use Presentation\ApiVersion1\App\Http\Controllers\Controller;
use Application\Booking\Actions\ApiVersion1\GetBookingAction;
use Illuminate\Http\JsonResponse;

class GetBookingController extends Controller
{
    public function __invoke(int $id, GetBookingAction $action): JsonResponse
    {
        $result = $action->execute($id);

        if (!$result) {
            return response()->json(['error' => 'Not found'], 404);
        }

        return response()->json($result);
    }
}
