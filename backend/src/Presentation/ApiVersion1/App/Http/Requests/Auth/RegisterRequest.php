<?php

declare(strict_types=1);

namespace Presentation\ApiVersion1\App\Http\Requests\Auth;

use Presentation\ApiVersion1\App\Http\Requests\BaseRequest;

class RegisterRequest extends BaseRequest
{
    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'max:255'],
            'password' => ['required', 'string', 'min:8'],
        ];
    }
}
