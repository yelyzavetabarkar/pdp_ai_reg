<?php

declare(strict_types=1);

namespace Presentation\ApiVersion1\App\Http\Controllers\Booking;

use Presentation\ApiVersion1\App\Http\Controllers\Controller;
use Application\Booking\Actions\ApiVersion1\DeleteBookingAction;
use Illuminate\Http\JsonResponse;

class DeleteBookingController extends Controller
{
    public function __invoke(int $id, DeleteBookingAction $action): JsonResponse
    {
        $result = $action->execute($id);

        if (!$result) {
            return response()->json(['message' => 'Booking not found'], 404);
        }

        return response()->json(['success' => true]);
    }
}
