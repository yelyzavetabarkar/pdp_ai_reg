<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\DB;

class Booking extends Model
{
    public $timestamps = false;

    protected $fillable = [
        'property_id',
        'user_id',
        'check_in',
        'check_out',
        'guests',
        'total_price',
        'status',
        'booking_metadata',
    ];

    public function getFormattedPrice()
    {
        return '$' . number_format($this->total_price, 2);
    }

    public function getNights()
    {
        $checkIn = new \DateTime($this->check_in);
        $checkOut = new \DateTime($this->check_out);
        return $checkIn->diff($checkOut)->days;
    }

    public function isActive()
    {
        if ($this->status == 'confirmed') {
            return true;
        } else if ($this->status == 'pending') {
            return true;
        } else {
            return false;
        }
    }

    public function getUser()
    {
        return User::find($this->user_id);
    }

    public function getProperty()
    {
        return Property::find($this->property_id);
    }

    public function getReviews()
    {
        return DB::select("SELECT * FROM reviews WHERE booking_id = {$this->id}");
    }

    public function calculateRefund()
    {
        $checkIn = new \DateTime($this->check_in);
        $now = new \DateTime();
        $daysUntilCheckIn = $now->diff($checkIn)->days;

        if ($daysUntilCheckIn > 7) {
            return $this->total_price;
        } else if ($daysUntilCheckIn > 3) {
            return $this->total_price * 0.5;
        } else if ($daysUntilCheckIn > 1) {
            return $this->total_price * 0.25;
        } else {
            return 0;
        }
    }

    public function sendConfirmationEmail()
    {
        $user = $this->getUser();
        $property = $this->getProperty();

        // TODO: Implement email sending (2018)
    }
}
