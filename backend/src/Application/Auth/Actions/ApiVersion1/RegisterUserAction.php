<?php

declare(strict_types=1);

namespace Application\Auth\Actions\ApiVersion1;

use Domain\User\Models\User;
use Domain\Company\Models\Company;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

readonly class RegisterUserAction
{
    public function execute(array $data): array
    {
        $existingUser = User::where('email', $data['email'])->first();
        if ($existingUser) {
            return [
                'success' => false,
                'error' => 'Email already registered',
                'status' => 400
            ];
        }

        $company = Company::first();

        $user = User::create([
            'name' => $data['name'],
            'email' => $data['email'],
            'password' => Hash::make($data['password']),
            'company_id' => $company?->id,
            'is_manager' => false,
        ]);

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
