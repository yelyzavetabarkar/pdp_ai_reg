<?php

declare(strict_types=1);

namespace Application\User\Actions\ApiVersion1;

use Domain\User\Models\User;

readonly class UpdateUserProfileAction
{
    public function execute(int $userId, array $data): ?array
    {
        $user = User::find($userId);

        if (!$user) {
            return null;
        }

        if (isset($data['name'])) {
            $user->name = $data['name'];
        }

        if (isset($data['email'])) {
            $user->email = $data['email'];
        }

        $user->save();

        return [
            'success' => true,
            'user' => $user
        ];
    }
}
