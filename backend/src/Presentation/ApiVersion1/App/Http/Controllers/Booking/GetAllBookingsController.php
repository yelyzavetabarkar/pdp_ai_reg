<?php

declare(strict_types=1);

namespace Presentation\ApiVersion1\App\Http\Controllers\Booking;

use Presentation\ApiVersion1\App\Http\Controllers\Controller;
use Application\Booking\Actions\ApiVersion1\GetAllBookingsAction;
use Illuminate\Http\JsonResponse;

class GetAllBookingsController extends Controller
{
    public function __invoke(GetAllBookingsAction $action): JsonResponse
    {
        return response()->json($action->execute());
    }
}
