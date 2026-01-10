<?php

declare(strict_types=1);

namespace Presentation\ApiVersion1\App\Http\Requests\User;

use Presentation\ApiVersion1\App\Http\Requests\BaseRequest;

class UpdateUserProfileRequest extends BaseRequest
{
    public function rules(): array
    {
        return [
            'name' => ['sometimes', 'string', 'max:255'],
            'email' => ['sometimes', 'email', 'max:255'],
        ];
    }
}
