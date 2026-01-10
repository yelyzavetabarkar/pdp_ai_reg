<?php

declare(strict_types=1);

namespace Presentation\ApiVersion1\App\Http\Controllers\Property;

use Presentation\ApiVersion1\App\Http\Controllers\Controller;
use Application\Property\Actions\ApiVersion1\GetAllPropertiesAction;

class GetAllPropertiesController extends Controller
{
    public function __invoke(GetAllPropertiesAction $action)
    {
        return $action->execute();
    }
}
