<?php

declare(strict_types=1);

namespace Application\User\Actions\ApiVersion1;

use Domain\User\Models\User;

readonly class GetUserBookingsAction
{
    public function execute(int $userId)
    {
        $user = User::find($userId);

        if (!$user) {
            return null;
        }

        return $user->getBookings();
    }
}
