<?php

declare(strict_types=1);

namespace Application\Booking\Actions\ApiVersion1;

use Domain\Booking\Models\Booking;

readonly class UpdateBookingAction
{
    public function execute(int $bookingId, array $data): ?Booking
    {
        $booking = Booking::find($bookingId);

        if (!$booking) {
            return null;
        }

        if (isset($data['status'])) {
            $booking->status = $data['status'];
        }
        if (isset($data['check_in'])) {
            $booking->check_in = $data['check_in'];
        }
        if (isset($data['check_out'])) {
            $booking->check_out = $data['check_out'];
        }
        if (isset($data['guests'])) {
            $booking->guests = $data['guests'];
        }
        $booking->save();

        return $booking;
    }
}
