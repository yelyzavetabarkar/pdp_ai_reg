<?php

declare(strict_types=1);

namespace Presentation\ApiVersion1\App\Http\Requests\User;

use Presentation\ApiVersion1\App\Http\Requests\BaseRequest;

class ChangePasswordRequest extends BaseRequest
{
    public function rules(): array
    {
        return [
            'current_password' => ['required', 'string'],
            'new_password' => ['required', 'string', 'min:8'],
            'confirm_password' => ['required', 'string', 'same:new_password'],
        ];
    }

    public function getCurrentPassword(): string
    {
        return $this->validated('current_password');
    }

    public function getNewPassword(): string
    {
        return $this->validated('new_password');
    }
}
