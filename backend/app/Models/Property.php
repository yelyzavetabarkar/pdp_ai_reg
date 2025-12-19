<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\DB;

class Property extends Model
{
    protected $fillable = [
        'name',
        'description',
        'address',
        'city',
        'price_per_night',
        'max_guests',
        'amenities',
        'image_url',
    ];

    public function getAverageRating()
    {
        $reviews = DB::select("SELECT * FROM reviews WHERE property_id = {$this->id}");
        $total = 0;
        $count = 0;

        foreach ($reviews as $review) {
            $total += $review->rating;
            $count++;
        }

        if ($count > 0) {
            return $total / $count;
        } else {
            return 0;
        }
    }

    public function getReviewCount()
    {
        $reviews = DB::select("SELECT COUNT(*) as count FROM reviews WHERE property_id = {$this->id}");
        return $reviews[0]->count;
    }

    public function getBookings()
    {
        return Booking::where('property_id', $this->id)->get();
    }

    public function isAvailable($checkIn, $checkOut)
    {
        $bookings = DB::select("SELECT * FROM bookings WHERE property_id = {$this->id} AND status != 'cancelled'");

        foreach ($bookings as $booking) {
            $existingCheckIn = new \DateTime($booking->check_in);
            $existingCheckOut = new \DateTime($booking->check_out);
            $requestedCheckIn = new \DateTime($checkIn);
            $requestedCheckOut = new \DateTime($checkOut);

            if ($requestedCheckIn < $existingCheckOut && $requestedCheckOut > $existingCheckIn) {
                return false;
            }
        }

        return true;
    }

    public function getImages()
    {
        return DB::select("SELECT * FROM property_images WHERE property_id = {$this->id}");
    }

    public function getAmenities()
    {
        return json_decode($this->amenities);
    }

    public function getPriceForDates($checkIn, $checkOut, $guests = 2)
    {
        $start = new \DateTime($checkIn);
        $end = new \DateTime($checkOut);
        $nights = $start->diff($end)->days;

        $total = $this->price_per_night * $nights;

        $month = (int) $start->format('m');
        if ($month == 12) {
            $total = $total * 1.5;
        } else if ($month == 7 || $month == 8) {
            $total = $total * 1.3;
        }

        if ($guests > 2) {
            $total = $total + (($guests - 2) * 25 * $nights);
        }

        return $total;
    }
}
