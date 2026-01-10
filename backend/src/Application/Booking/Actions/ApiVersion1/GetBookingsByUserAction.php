<?php

declare(strict_types=1);

namespace Application\Booking\Actions\ApiVersion1;

use Domain\Booking\Eloquent\BookingReadEloquent;

readonly class GetBookingsByUserAction
{
    public function __construct(
        private BookingReadEloquent $bookingReadEloquent
    ) {}

    public function execute(int $userId): array
    {
        return $this->bookingReadEloquent->getByUser($userId);
    }
}
