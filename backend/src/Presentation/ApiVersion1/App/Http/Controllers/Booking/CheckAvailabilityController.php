<?php

declare(strict_types=1);

namespace Presentation\ApiVersion1\App\Http\Controllers\Booking;

use Presentation\ApiVersion1\App\Http\Controllers\Controller;
use Application\Booking\Actions\ApiVersion1\CheckAvailabilityAction;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class CheckAvailabilityController extends Controller
{
    public function __invoke(int $propertyId, Request $request, CheckAvailabilityAction $action): JsonResponse
    {
        $startDate = $request->query('start_date');
        $endDate = $request->query('end_date');

        return response()->json($action->execute($propertyId, $startDate, $endDate));
    }
}
