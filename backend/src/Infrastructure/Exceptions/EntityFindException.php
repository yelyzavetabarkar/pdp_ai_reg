<?php

declare(strict_types=1);

namespace Infrastructure\Exceptions;

use Exception;

abstract class EntityFindException extends Exception
{
    protected string $entityName = 'Entity';

    public function __construct(string $message = '')
    {
        parent::__construct($message ?: "{$this->entityName} not found");
    }
}
