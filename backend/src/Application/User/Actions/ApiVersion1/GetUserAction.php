<?php

declare(strict_types=1);

namespace Application\User\Actions\ApiVersion1;

use Domain\User\Models\User;

readonly class GetUserAction
{
    public function execute(int $userId): ?User
    {
        return User::find($userId);
    }
}
