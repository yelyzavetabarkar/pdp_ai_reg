<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

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
