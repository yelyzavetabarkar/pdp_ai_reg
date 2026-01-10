<?php

declare(strict_types=1);

namespace Application\User\Actions\ApiVersion1;

use Domain\User\Models\User;

readonly class GetAllUsersAction
{
    public function execute()
    {
        return User::all();
    }
}
