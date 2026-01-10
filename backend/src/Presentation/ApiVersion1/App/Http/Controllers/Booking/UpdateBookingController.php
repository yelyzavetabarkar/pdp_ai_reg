<?php

declare(strict_types=1);

namespace Presentation\ApiVersion1\App\Http\Controllers\Booking;

use Presentation\ApiVersion1\App\Http\Controllers\Controller;
use Presentation\ApiVersion1\App\Http\Requests\Booking\UpdateBookingRequest;
use Application\Booking\Actions\ApiVersion1\UpdateBookingAction;
use Illuminate\Http\JsonResponse;

class UpdateBookingController extends Controller
{
    public function __invoke(int $id, UpdateBookingRequest $request, UpdateBookingAction $action): JsonResponse
    {
        $result = $action->execute($id, $request->all());

        if (!$result) {
            return response()->json(['error' => 'Not found'], 404);
        }

        return response()->json($result);
    }
}
