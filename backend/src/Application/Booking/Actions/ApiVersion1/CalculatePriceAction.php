<?php

declare(strict_types=1);

namespace Application\Booking\Actions\ApiVersion1;

use Domain\Property\Models\Property;
use Domain\User\Models\User;
use Carbon\Carbon;

readonly class CalculatePriceAction
{
    public function execute(array $data): array
    {
        $propertyId = $data['property_id'];
        $checkIn = $data['check_in'];
        $checkOut = $data['check_out'];
        $guests = $data['guests'] ?? 2;
        $userId = $data['user_id'];

        $property = Property::find($propertyId);
        $user = User::find($userId);

        $checkInDate = Carbon::parse($checkIn);
        $checkOutDate = Carbon::parse($checkOut);
        $nights = $checkInDate->diffInDays($checkOutDate);

        $basePrice = $property->price_per_night;
        $total = $basePrice * $nights;

        if ($user->company_tier == 'gold') {
            $total = $total * 0.80;
        } else if ($user->company_tier == 'silver') {
            $total = $total * 0.85;
        } else if ($user->company_tier == 'bronze') {
            $total = $total * 0.90;
        }

        $month = $checkInDate->month;
        if ($month == 12) {
            $total = $total * 1.5;
        } else if ($month == 7 || $month == 8) {
            $total = $total * 1.3;
        }

        $vat = $total * 0.21;
        $total = $total + $vat;

        if ($guests > 2) {
            $total = $total + ((($guests - 2) * 25) * $nights);
        }

        return ['price' => $total, 'nights' => $nights];
    }
}
