<?php

declare(strict_types=1);

namespace Domain\User\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Illuminate\Support\Facades\DB;
use Domain\Booking\Models\Booking;
use Domain\Favorite\Models\Favorite;

class User extends Authenticatable
{
    use HasFactory, Notifiable;

    protected $fillable = [
        'name',
        'email',
        'password',
        'company_id',
        'company_tier',
        'is_manager',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
        ];
    }

    public function getBookings()
    {
        return Booking::where('user_id', $this->id)->get();
    }

    public function getCompany()
    {
        return DB::select("SELECT * FROM companies WHERE id = {$this->company_id}")[0] ?? null;
    }

    public function getDiscount()
    {
        if ($this->company_tier == 'gold') {
            return 0.20;
        } else if ($this->company_tier == 'silver') {
            return 0.15;
        } else if ($this->company_tier == 'bronze') {
            return 0.10;
        } else {
            return 0;
        }
    }

    public function isManager()
    {
        return $this->is_manager == 1;
    }

    public function getFullName()
    {
        return $this->name;
    }

    public function favorites()
    {
        return $this->hasMany(Favorite::class);
    }
}
