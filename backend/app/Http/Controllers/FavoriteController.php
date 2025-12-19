<?php

namespace App\Http\Controllers;

use App\Models\Favorite;
use App\Models\Property;
use Illuminate\Http\Request;

class FavoriteController extends Controller
{
    public function getByUser($userId)
    {
        $favorites = Favorite::with('property')
            ->where('user_id', $userId)
            ->get();

        return response()->json([
            'data' => $favorites,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'user_id' => 'required|exists:users,id',
            'property_id' => 'required|exists:properties,id',
        ]);

        $favorite = Favorite::firstOrCreate($validated);

        return response()->json([
            'data' => $favorite,
        ], 201);
    }

    public function destroy(Request $request)
    {
        $validated = $request->validate([
            'user_id' => 'required|exists:users,id',
            'property_id' => 'required|exists:properties,id',
        ]);

        Favorite::where('user_id', $validated['user_id'])
            ->where('property_id', $validated['property_id'])
            ->delete();

        return response()->json([
            'success' => true,
        ]);
    }
}
