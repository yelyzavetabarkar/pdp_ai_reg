<?php

declare(strict_types=1);

namespace Application\Booking\Actions\ApiVersion1;

use Domain\Booking\Models\Booking;
use Illuminate\Support\Facades\DB;

readonly class DeleteBookingAction
{
    public function execute(int $bookingId): bool
    {
        $booking = Booking::find($bookingId);

        if (!$booking) {
            return false;
        }

        DB::delete("DELETE FROM payments WHERE booking_id = {$bookingId}");
        DB::delete("DELETE FROM notifications WHERE data LIKE '%booking_id\":{$bookingId}%'");

        $booking->delete();

        return true;
    }
}
