<?php

declare(strict_types=1);

namespace Domain\Booking\Exceptions;

use Infrastructure\Exceptions\EntityFindException;

class BookingFindException extends EntityFindException
{
    protected string $entityName = 'Booking';
}
