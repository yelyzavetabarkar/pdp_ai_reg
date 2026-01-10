<?php

declare(strict_types=1);

namespace Domain\User\Exceptions;

use Infrastructure\Exceptions\EntityFindException;

class UserFindException extends EntityFindException
{
    protected string $entityName = 'User';
}
