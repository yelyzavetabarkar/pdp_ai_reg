<?php

declare(strict_types=1);

namespace Domain\Property\Exceptions;

use Infrastructure\Exceptions\EntityFindException;

class PropertyFindException extends EntityFindException
{
    protected string $entityName = 'Property';
}
