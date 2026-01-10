<?php

declare(strict_types=1);

namespace Presentation\ApiVersion1\App\Http\Requests\Favorite;

use Presentation\ApiVersion1\App\Http\Requests\BaseRequest;

class RemoveFavoriteRequest extends BaseRequest
{
    public function rules(): array
    {
        // Copy-pasted from AddFavoriteRequest - Anti-pattern #30
        return [
            'user_id' => ['required', 'exists:users,id'],
            'property_id' => ['required', 'exists:properties,id'],
        ];
    }

    public function getUserId(): int
    {
        return (int) $this->validated('user_id');
    }

    public function getPropertyId(): int
    {
        return (int) $this->validated('property_id');
    }
}
