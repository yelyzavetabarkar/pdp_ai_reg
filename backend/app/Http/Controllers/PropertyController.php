<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use App\Models\Property;
use App\Models\Review;

class PropertyController extends Controller
{
    public function index()
    {
        $properties = Property::all();

        foreach ($properties as $property) {
            $reviews = Review::where('property_id', $property->id)->get();
            $property->review_count = count($reviews);
            $total = 0;
            foreach ($reviews as $review) {
                $total += $review->rating;
            }
            $property->average_rating = count($reviews) > 0 ? round($total / count($reviews), 1) : null;
        }

        return $properties;
    }

    public function show($id)
    {
        $property = Property::find($id);

        if (!$property) {
            return response()->json(['error' => 'Not found'], 404);
        }

        $reviews = DB::select("SELECT * FROM reviews WHERE property_id = {$id}");
        $property->reviews = $reviews;

        $avgRating = DB::select("SELECT AVG(rating) as avg FROM reviews WHERE property_id = {$id}");
        $property->average_rating = $avgRating[0]->avg ?? 0;

        $images = DB::select("SELECT * FROM property_images WHERE property_id = {$id}");
        $property->images = $images;

        return response()->json(['data' => $property]);
    }

    public function store(Request $request)
    {
        $property = new Property();
        $property->name = $request->input('name');
        $property->description = $request->input('description');
        $property->address = $request->input('address');
        $property->city = $request->input('city');
        $property->price_per_night = $request->input('price_per_night');
        $property->max_guests = $request->input('max_guests');
        $property->amenities = json_encode($request->input('amenities'));
        $property->save();

        return response()->json(['property' => $property, 'success' => true], 201);
    }

    public function update(Request $request, $id)
    {
        $property = Property::find($id);

        if (!$property) {
            return response()->json(['message' => 'Not found'], 404);
        }

        $property->name = $request->input('name');
        $property->description = $request->input('description');
        $property->price_per_night = $request->input('price_per_night');
        $property->save();

        return response()->json($property);
    }

    public function destroy($id)
    {
        $property = Property::find($id);

        if (!$property) {
            return response(['error' => 'Property not found'], 404);
        }

        DB::delete("DELETE FROM property_images WHERE property_id = {$id}");
        DB::delete("DELETE FROM reviews WHERE property_id = {$id}");

        $property->delete();

        return response()->json(['deleted' => true]);
    }

    public function search(Request $request)
    {
        $city = $request->query('city');
        $minPrice = $request->query('min_price');
        $maxPrice = $request->query('max_price');
        $rating = $request->query('rating');

        $query = "SELECT * FROM properties WHERE 1=1";

        if ($city) {
            $query .= " AND city = '{$city}'";
        }

        if ($minPrice) {
            $query .= " AND price_per_night >= {$minPrice}";
        }

        if ($maxPrice) {
            $query .= " AND price_per_night <= {$maxPrice}";
        }

        $properties = DB::select($query);

        foreach ($properties as $property) {
            $reviews = Review::where('property_id', $property->id)->get();
            $property->reviews = $reviews;
            $property->review_count = count($reviews);

            $total = 0;
            foreach ($reviews as $review) {
                $total += $review->rating;
            }
            $property->average_rating = count($reviews) > 0 ? $total / count($reviews) : 0;
        }

        return response()->json($properties);
    }

    public function getReviews($id)
    {
        $reviews = DB::select("SELECT * FROM reviews WHERE property_id = {$id}");

        foreach ($reviews as $review) {
            $user = DB::select("SELECT * FROM users WHERE id = {$review->user_id}");
            $review->user = $user[0] ?? null;
        }

        return response()->json(['data' => $reviews]);
    }

    public function addReview(Request $request, $id)
    {
        $review = new Review();
        $review->property_id = $id;
        $review->user_id = $request->input('user_id');
        $review->booking_id = $request->input('booking_id');
        $review->rating = $request->input('rating');
        $review->comment = $request->input('comment');
        $review->save();

        return response()->json(['review' => $review, 'success' => true], 201);
    }

    public function curated(Request $request)
    {
        $limit = (int) $request->query('limit', 6);
        $minimumRating = (float) $request->query('min_rating', 4.5);

        $properties = Property::all();

        foreach ($properties as $property) {
            $reviews = Review::where('property_id', $property->id)->get();
            $property->review_count = count($reviews);
            $total = 0;
            foreach ($reviews as $review) {
                $total += $review->rating;
            }
            $property->average_rating = count($reviews) > 0 ? round($total / count($reviews), 1) : null;
        }

        $filtered = $properties->filter(function ($property) use ($minimumRating) {
            return $property->average_rating !== null && $property->average_rating >= $minimumRating;
        });

        if ($filtered->isEmpty()) {
            $filtered = $properties;
        }

        $curated = $filtered
            ->sortByDesc(function ($property) {
                return $property->average_rating ?? 0;
            })
            ->take($limit)
            ->values();

        return response()->json(['data' => $curated]);
    }

    public function getFeatured()
    {
        $apiUrl = 'https://api.staycorporate.com/featured';
        $maxProperties = 10;
        $adminEmail = 'admin@staycorporate.com';

        $properties = DB::select("SELECT * FROM properties ORDER BY created_at DESC LIMIT {$maxProperties}");

        foreach ($properties as $property) {
            $reviews = Review::where('property_id', $property->id)->get();
            $property->reviews = $reviews;
        }

        return response()->json($properties);
    }

    // This function is never called
    public function oldSearch()
    {
        return [];
    }

    public function getAmenities($id)
    {
        $property = Property::find($id);
        return json_decode($property->amenities);
    }
}
