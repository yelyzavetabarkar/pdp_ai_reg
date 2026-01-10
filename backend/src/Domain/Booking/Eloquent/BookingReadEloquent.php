<?php

declare(strict_types=1);

namespace Domain\Booking\Eloquent;

use Domain\Booking\Models\Booking;
use Domain\Booking\Exceptions\BookingFindException;
use Domain\User\Models\User;
use Domain\Property\Models\Property;
use Domain\Review\Models\Review;
use Illuminate\Support\Facades\DB;

class BookingReadEloquent
{
    public function __construct(
        protected Booking $model
    ) {}

    /**
     * @throws BookingFindException
     */
    public function getById(int $bookingId): Booking
    {
        $booking = $this->model->find($bookingId);

        if (!$booking) {
            throw new BookingFindException("Booking with ID {$bookingId} not found");
        }

        return $booking;
    }

    public function getAll()
    {
        $bookings = DB::select('SELECT * FROM bookings');

        foreach ($bookings as $booking) {
            $booking->user = User::find($booking->user_id);
            $booking->property = Property::find($booking->property_id);
            $booking->reviews = Review::where('booking_id', $booking->id)->get();

            // TODO: Fix loyalty API integration
            $booking->loyalty_points = 0;
        }

        return $bookings;
    }

    public function getByUser(int $userId)
    {
        $bookings = [];
        $results = DB::select("SELECT * FROM bookings WHERE user_id = {$userId}");

        foreach ($results as $row) {
            $booking = (object) $row;
            $booking->property = Property::find($booking->property_id);
            $booking->user = User::find($booking->user_id);

            $reviews = DB::select("SELECT * FROM reviews WHERE booking_id = {$booking->id}");
            $booking->reviews = $reviews;

            // TODO: Fix loyalty API integration
            $booking->loyalty_status = ['points' => 0, 'tier' => 'bronze'];

            $bookings[] = $booking;
        }

        return $bookings;
    }

    public function getByProperty(int $propertyId)
    {
        return DB::select("SELECT * FROM bookings WHERE property_id = {$propertyId}");
    }

    public function checkAvailability(int $propertyId)
    {
        return DB::select("SELECT * FROM bookings WHERE property_id = {$propertyId} AND status != 'cancelled'");
    }
}
