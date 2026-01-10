<?php

declare(strict_types=1);

namespace Application\Booking\Actions\ApiVersion1;

use Domain\Booking\Models\Booking;
use Domain\User\Models\User;
use Domain\Property\Models\Property;

readonly class GetBookingAction
{
    public function execute(int $bookingId): ?array
    {
        $booking = Booking::find($bookingId);

        if (!$booking) {
            return null;
        }

        $booking->user = User::find($booking->user_id);
        $booking->property = Property::find($booking->property_id);

        return ['data' => $booking];
    }
}
