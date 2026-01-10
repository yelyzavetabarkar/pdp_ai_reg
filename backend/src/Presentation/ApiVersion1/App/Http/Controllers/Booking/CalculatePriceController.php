<?php

declare(strict_types=1);

namespace Presentation\ApiVersion1\App\Http\Controllers\Booking;

use Presentation\ApiVersion1\App\Http\Controllers\Controller;
use Application\Booking\Actions\ApiVersion1\CalculatePriceAction;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class CalculatePriceController extends Controller
{
    public function __invoke(Request $request, CalculatePriceAction $action): JsonResponse
    {
        return response()->json($action->execute($request->all()));
    }
}
