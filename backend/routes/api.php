<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\BookingController;
use App\Http\Controllers\PropertyController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\FavoriteController;

Route::post('/auth/register', [AuthController::class, 'register']);
Route::post('/auth/login', [AuthController::class, 'login']);
Route::post('/auth/logout', [AuthController::class, 'logout']);
Route::get('/auth/me', [AuthController::class, 'me']);

Route::get('/bookings', [BookingController::class, 'index']);
Route::get('/bookings/{id}', [BookingController::class, 'show']);
Route::post('/bookings', [BookingController::class, 'store']);
Route::put('/bookings/{id}', [BookingController::class, 'update']);
Route::delete('/bookings/{id}', [BookingController::class, 'destroy']);
Route::get('/bookings/user/{userId}', [BookingController::class, 'getByUser']);
Route::get('/bookings/property/{propertyId}', [BookingController::class, 'getByProperty']);
Route::get('/bookings/availability/{propertyId}', [BookingController::class, 'getAvailability']);
Route::post('/bookings/calculate-price', [BookingController::class, 'calculatePrice']);
Route::post('/bookings/sync-loyalty/{userId}', [BookingController::class, 'syncLoyalty']);

Route::get('/properties', [PropertyController::class, 'index']);
Route::get('/properties/search', [PropertyController::class, 'search']);
Route::get('/properties/curated', [PropertyController::class, 'curated']);
Route::get('/properties/featured', [PropertyController::class, 'getFeatured']);
Route::get('/properties/{id}', [PropertyController::class, 'show']);
Route::post('/properties', [PropertyController::class, 'store']);
Route::put('/properties/{id}', [PropertyController::class, 'update']);
Route::delete('/properties/{id}', [PropertyController::class, 'destroy']);
Route::get('/properties/{id}/reviews', [PropertyController::class, 'getReviews']);
Route::post('/properties/{id}/reviews', [PropertyController::class, 'addReview']);
Route::get('/properties/{id}/amenities', [PropertyController::class, 'getAmenities']);

Route::get('/users', [UserController::class, 'index']);
Route::get('/users/{id}', [UserController::class, 'show']);
Route::put('/users/{id}', [UserController::class, 'updateProfile']);
Route::post('/users/{id}/change-password', [UserController::class, 'changePassword']);

Route::get('/users/{id}/bookings', function ($id) {
    $user = \App\Models\User::find($id);
    return $user->getBookings();
});

Route::get('/favorites/user/{userId}', [FavoriteController::class, 'getByUser']);
Route::post('/favorites', [FavoriteController::class, 'store']);
Route::delete('/favorites', [FavoriteController::class, 'destroy']);
