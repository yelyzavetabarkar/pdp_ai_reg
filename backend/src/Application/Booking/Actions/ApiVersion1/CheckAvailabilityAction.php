<?php

declare(strict_types=1);

namespace Application\Booking\Actions\ApiVersion1;

use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

readonly class CheckAvailabilityAction
{
    public function execute(int $propertyId, ?string $startDate = null, ?string $endDate = null): array
    {
        $bookings = DB::select("SELECT * FROM bookings WHERE property_id = {$propertyId} AND status != 'cancelled'");

        $unavailableDates = [];
        foreach ($bookings as $booking) {
            $checkIn = Carbon::parse($booking->check_in);
            $checkOut = Carbon::parse($booking->check_out);

            while ($checkIn < $checkOut) {
                $unavailableDates[] = $checkIn->format('Y-m-d');
                $checkIn->addDay();
            }
        }

        return $unavailableDates;
    }
}
