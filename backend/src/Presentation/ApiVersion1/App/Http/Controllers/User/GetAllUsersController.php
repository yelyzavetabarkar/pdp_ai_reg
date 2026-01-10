<?php

declare(strict_types=1);

namespace Presentation\ApiVersion1\App\Http\Controllers\User;

use Presentation\ApiVersion1\App\Http\Controllers\Controller;
use Application\User\Actions\ApiVersion1\GetAllUsersAction;

class GetAllUsersController extends Controller
{
    public function __invoke(GetAllUsersAction $action)
    {
        return $action->execute();
    }
}
