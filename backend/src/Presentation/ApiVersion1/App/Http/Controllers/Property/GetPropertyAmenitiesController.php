<?php

declare(strict_types=1);

namespace Presentation\ApiVersion1\App\Http\Controllers\Property;

use Presentation\ApiVersion1\App\Http\Controllers\Controller;
use Application\Property\Actions\ApiVersion1\GetPropertyAmenitiesAction;
use Illuminate\Http\JsonResponse;

class GetPropertyAmenitiesController extends Controller
{
    public function __invoke(int $id, GetPropertyAmenitiesAction $action)
    {
        return $action->execute($id);
    }
}
