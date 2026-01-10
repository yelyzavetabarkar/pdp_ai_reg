<?php

declare(strict_types=1);

namespace Application\User\Actions\ApiVersion1;

use Domain\User\Models\User;
use Illuminate\Support\Facades\Hash;

readonly class ChangePasswordAction
{
    public function execute(int $userId, string $currentPassword, string $newPassword): array
    {
        $user = User::find($userId);

        if (!$user) {
            return [
                'success' => false,
                'error' => 'User not found',
                'status' => 404
            ];
        }

        if (!Hash::check($currentPassword, $user->password)) {
            return [
                'success' => false,
                'error' => 'Current password is incorrect',
                'status' => 400
            ];
        }

        $user->password = Hash::make($newPassword);
        $user->save();

        return [
            'success' => true,
            'message' => 'Password changed successfully'
        ];
    }
}
