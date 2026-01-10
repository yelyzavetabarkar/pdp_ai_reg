<?php

declare(strict_types=1);

namespace Presentation\ApiVersion1\App\Http\Controllers\Booking;

use Presentation\ApiVersion1\App\Http\Controllers\Controller;
use Presentation\ApiVersion1\App\Http\Requests\Booking\CreateBookingRequest;
use Application\Booking\Actions\ApiVersion1\CreateBookingAction;
use Illuminate\Http\JsonResponse;
use Symfony\Component\HttpFoundation\Response;

class CreateBookingController extends Controller
{
    public function __invoke(CreateBookingRequest $request, CreateBookingAction $action): JsonResponse|Response
    {
        $result = $action->execute($request->all());

        if (isset($result['error'])) {
            $status = $result['status'] ?? 400;
            $format = $result['format'] ?? 'error';

            if ($format === 'plain') {
                return response($result['error'], $status);
            }

            if ($format === 'message') {
                return response()->json(['message' => $result['error']], $status);
            }

            if ($format === 'errors') {
                return response()->json(['errors' => ['user_id' => [$result['error']]]], $status);
            }

            return response()->json(['error' => $result['error']], $status);
        }

        return response()->json(['booking' => $result['booking'], 'success' => true], 201);
    }
}
