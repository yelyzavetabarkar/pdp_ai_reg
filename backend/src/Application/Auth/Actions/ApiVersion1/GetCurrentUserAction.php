<?php

declare(strict_types=1);

namespace Application\Auth\Actions\ApiVersion1;

readonly class GetCurrentUserAction
{
    public function execute(?string $token): array
    {
        if (!$token) {
            return [
                'success' => false,
                'error' => 'Not authenticated',
                'status' => 401
            ];
        }

        return [
            'success' => false,
            'error' => 'Not authenticated',
            'status' => 401
        ];
    }
}
