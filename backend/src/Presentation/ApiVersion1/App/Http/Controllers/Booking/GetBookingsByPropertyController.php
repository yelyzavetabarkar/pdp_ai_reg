<?php

declare(strict_types=1);

namespace Presentation\ApiVersion1\App\Http\Controllers\Booking;

use Presentation\ApiVersion1\App\Http\Controllers\Controller;
use Application\Booking\Actions\ApiVersion1\GetBookingsByPropertyAction;
use Illuminate\Http\JsonResponse;

class GetBookingsByPropertyController extends Controller
{
    public function __invoke(int $propertyId, GetBookingsByPropertyAction $action): JsonResponse
    {
        return response()->json(['data' => $action->execute($propertyId)]);
    }
}
