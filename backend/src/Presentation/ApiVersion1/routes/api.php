<?php

declare(strict_types=1);

use Illuminate\Support\Facades\Route;
use Presentation\ApiVersion1\App\Http\Controllers\Auth\RegisterController;
use Presentation\ApiVersion1\App\Http\Controllers\Auth\LoginController;
use Presentation\ApiVersion1\App\Http\Controllers\Auth\LogoutController;
use Presentation\ApiVersion1\App\Http\Controllers\Auth\GetCurrentUserController;
use Presentation\ApiVersion1\App\Http\Controllers\Booking\GetAllBookingsController;
use Presentation\ApiVersion1\App\Http\Controllers\Booking\GetBookingController;
use Presentation\ApiVersion1\App\Http\Controllers\Booking\CreateBookingController;
use Presentation\ApiVersion1\App\Http\Controllers\Booking\UpdateBookingController;
use Presentation\ApiVersion1\App\Http\Controllers\Booking\DeleteBookingController;
use Presentation\ApiVersion1\App\Http\Controllers\Booking\GetBookingsByUserController;
use Presentation\ApiVersion1\App\Http\Controllers\Booking\GetBookingsByPropertyController;
use Presentation\ApiVersion1\App\Http\Controllers\Booking\CheckAvailabilityController;
use Presentation\ApiVersion1\App\Http\Controllers\Booking\CalculatePriceController;
use Presentation\ApiVersion1\App\Http\Controllers\Booking\SyncLoyaltyController;
use Presentation\ApiVersion1\App\Http\Controllers\Property\GetAllPropertiesController;
use Presentation\ApiVersion1\App\Http\Controllers\Property\GetPropertyController;
use Presentation\ApiVersion1\App\Http\Controllers\Property\CreatePropertyController;
use Presentation\ApiVersion1\App\Http\Controllers\Property\UpdatePropertyController;
use Presentation\ApiVersion1\App\Http\Controllers\Property\DeletePropertyController;
use Presentation\ApiVersion1\App\Http\Controllers\Property\SearchPropertiesController;
use Presentation\ApiVersion1\App\Http\Controllers\Property\GetCuratedPropertiesController;
use Presentation\ApiVersion1\App\Http\Controllers\Property\GetFeaturedPropertiesController;
use Presentation\ApiVersion1\App\Http\Controllers\Property\GetPropertyReviewsController;
use Presentation\ApiVersion1\App\Http\Controllers\Property\AddPropertyReviewController;
use Presentation\ApiVersion1\App\Http\Controllers\Property\GetPropertyAmenitiesController;
use Presentation\ApiVersion1\App\Http\Controllers\User\GetAllUsersController;
use Presentation\ApiVersion1\App\Http\Controllers\User\GetUserController;
use Presentation\ApiVersion1\App\Http\Controllers\User\UpdateUserProfileController;
use Presentation\ApiVersion1\App\Http\Controllers\User\ChangePasswordController;
use Presentation\ApiVersion1\App\Http\Controllers\User\GetUserBookingsController;
use Presentation\ApiVersion1\App\Http\Controllers\Favorite\GetUserFavoritesController;
use Presentation\ApiVersion1\App\Http\Controllers\Favorite\AddFavoriteController;
use Presentation\ApiVersion1\App\Http\Controllers\Favorite\RemoveFavoriteController;

// Auth Routes
Route::post('/auth/register', RegisterController::class);
Route::post('/auth/login', LoginController::class);
Route::post('/auth/logout', LogoutController::class);
Route::get('/auth/me', GetCurrentUserController::class);

// Booking Routes
Route::get('/bookings', GetAllBookingsController::class);
Route::get('/bookings/{id}', GetBookingController::class)->whereNumber('id');
Route::post('/bookings', CreateBookingController::class);
Route::put('/bookings/{id}', UpdateBookingController::class)->whereNumber('id');
Route::delete('/bookings/{id}', DeleteBookingController::class)->whereNumber('id');
Route::get('/bookings/user/{userId}', GetBookingsByUserController::class)->whereNumber('userId');
Route::get('/bookings/property/{propertyId}', GetBookingsByPropertyController::class)->whereNumber('propertyId');
Route::get('/bookings/availability/{propertyId}', CheckAvailabilityController::class)->whereNumber('propertyId');
Route::post('/bookings/calculate-price', CalculatePriceController::class);
Route::post('/bookings/sync-loyalty/{userId}', SyncLoyaltyController::class)->whereNumber('userId');

// Property Routes
Route::get('/properties', GetAllPropertiesController::class);
Route::get('/properties/search', SearchPropertiesController::class);
Route::get('/properties/curated', GetCuratedPropertiesController::class);
Route::get('/properties/featured', GetFeaturedPropertiesController::class);
Route::get('/properties/{id}', GetPropertyController::class)->whereNumber('id');
Route::post('/properties', CreatePropertyController::class);
Route::put('/properties/{id}', UpdatePropertyController::class)->whereNumber('id');
Route::delete('/properties/{id}', DeletePropertyController::class)->whereNumber('id');
Route::get('/properties/{id}/reviews', GetPropertyReviewsController::class)->whereNumber('id');
Route::post('/properties/{id}/reviews', AddPropertyReviewController::class)->whereNumber('id');
Route::get('/properties/{id}/amenities', GetPropertyAmenitiesController::class)->whereNumber('id');

// User Routes
Route::get('/users', GetAllUsersController::class);
Route::get('/users/{id}', GetUserController::class)->whereNumber('id');
Route::put('/users/{id}', UpdateUserProfileController::class)->whereNumber('id');
Route::post('/users/{id}/change-password', ChangePasswordController::class)->whereNumber('id');
Route::get('/users/{id}/bookings', GetUserBookingsController::class)->whereNumber('id');

// Favorite Routes
Route::get('/favorites/user/{userId}', GetUserFavoritesController::class)->whereNumber('userId');
Route::post('/favorites', AddFavoriteController::class);
Route::delete('/favorites', RemoveFavoriteController::class);
