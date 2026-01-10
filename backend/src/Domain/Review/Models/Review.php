<?php

declare(strict_types=1);

namespace Domain\Review\Models;

use Illuminate\Database\Eloquent\Model;
use Domain\User\Models\User;
use Domain\Property\Models\Property;
use Domain\Booking\Models\Booking;

class Review extends Model
{
    protected $fillable = [
        'property_id',
        'user_id',
        'booking_id',
        'rating',
        'comment',
    ];

    public function getUser()
    {
        return User::find($this->user_id);
    }

    public function getProperty()
    {
        return Property::find($this->property_id);
    }

    public function getBooking()
    {
        return Booking::find($this->booking_id);
    }

    public function getFormattedDate()
    {
        return $this->created_at->format('M d, Y');
    }

    public function getStars()
    {
        $stars = '';
        for ($i = 0; $i < $this->rating; $i++) {
            $stars .= '★';
        }
        for ($i = $this->rating; $i < 5; $i++) {
            $stars .= '☆';
        }
        return $stars;
    }
}
