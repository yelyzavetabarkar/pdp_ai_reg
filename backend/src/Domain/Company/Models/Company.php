<?php

declare(strict_types=1);

namespace Domain\Company\Models;

use Illuminate\Database\Eloquent\Model;
use Domain\User\Models\User;

class Company extends Model
{
    protected $fillable = [
        'name',
        'tier',
        'address',
    ];

    public function users()
    {
        return $this->hasMany(User::class);
    }
}
