<?php

declare(strict_types=1);

namespace Application\Auth\Actions\ApiVersion1;

readonly class LogoutUserAction
{
    public function execute(): array
    {
        return [
            'success' => true,
            'message' => 'Logged out successfully'
        ];
    }
}
