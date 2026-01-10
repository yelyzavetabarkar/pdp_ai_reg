<?php

declare(strict_types=1);

namespace Application\Auth\Actions\ApiVersion1;

use Domain\User\Models\User;
use Domain\Company\Models\Company;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

readonly class LoginUserAction
{
    public function execute(string $email, string $password): array
    {
        $user = User::where('email', $email)->first();

        if (!$user) {
            return [
                'success' => false,
                'error' => 'User not found',
                'status' => 404
            ];
        }

        if (!Hash::check($password, $user->password)) {
            return [
                'success' => false,
                'error' => 'Invalid credentials',
                'status' => 401
            ];
        }

        $company = $user->company_id ? Company::find($user->company_id) : null;
        $token = Str::random(60);

        return [
            'success' => true,
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'company_id' => $user->company_id,
                'is_manager' => $user->is_manager,
            ],
            'company' => $company ? [
                'id' => $company->id,
                'name' => $company->name,
                'tier' => $company->tier,
            ] : null,
            'token' => $token,
        ];
    }
}
