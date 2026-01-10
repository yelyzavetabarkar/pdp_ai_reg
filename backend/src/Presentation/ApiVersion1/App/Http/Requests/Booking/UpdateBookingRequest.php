<?php

declare(strict_types=1);

namespace Presentation\ApiVersion1\App\Http\Requests\Booking;

use Presentation\ApiVersion1\App\Http\Requests\BaseRequest;

class UpdateBookingRequest extends BaseRequest
{
    public function rules(): array
    {
        // Copy-pasted validation rules from CreateBookingRequest - Anti-pattern #30
        return [
            'check_in' => ['sometimes', 'date', 'after:today'],
            'check_out' => ['sometimes', 'date', 'after:check_in'],
            'guests' => ['sometimes', 'int', 'min:1'],
            'status' => ['sometimes', 'string'],
        ];
    }
}
