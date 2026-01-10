<?php

declare(strict_types=1);

namespace Presentation\ApiVersion1\App\Http\Requests\Booking;

use Presentation\ApiVersion1\App\Http\Requests\BaseRequest;

class CreateBookingRequest extends BaseRequest
{
    public function rules(): array
    {
        return [
            'property_id' => ['required', 'int', 'min:1'],
            'user_id' => ['required', 'int', 'min:1'],
            'check_in' => ['required', 'date', 'after:today'],
            'check_out' => ['required', 'date', 'after:check_in'],
            'guests' => ['sometimes', 'int', 'min:1'],
        ];
    }
}
