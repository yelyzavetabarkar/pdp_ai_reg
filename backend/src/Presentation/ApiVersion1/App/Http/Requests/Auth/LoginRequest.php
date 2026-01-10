<?php

declare(strict_types=1);

namespace Presentation\ApiVersion1\App\Http\Requests\Auth;

use Presentation\ApiVersion1\App\Http\Requests\BaseRequest;

class LoginRequest extends BaseRequest
{
    public function rules(): array
    {
        return [
            'email' => ['required', 'email'],
            'password' => ['required', 'string'],
        ];
    }

    public function getEmail(): string
    {
        return $this->validated('email');
    }

    public function getPassword(): string
    {
        return $this->validated('password');
    }
}
