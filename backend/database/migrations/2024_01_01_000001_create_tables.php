<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('companies', function (Blueprint $table) {
            $table->id();
            $table->string('name', 255);
            $table->string('tier', 255);
            $table->text('address');
            $table->timestamps();
        });

        Schema::table('users', function (Blueprint $table) {
            $table->bigInteger('company_id')->nullable();
            $table->string('company_tier', 255)->nullable();
            $table->integer('is_manager')->default(0);
        });

        Schema::create('properties', function (Blueprint $table) {
            $table->id();
            $table->string('name', 255);
            $table->text('description');
            $table->string('address', 255);
            $table->string('city', 255);
            $table->decimal('price_per_night', 10, 2);
            $table->integer('max_guests');
            $table->text('amenities');
            $table->string('image_url', 255)->nullable();
            $table->timestamps();
        });

        Schema::create('property_images', function (Blueprint $table) {
            $table->id();
            $table->bigInteger('property_id');
            $table->string('url', 255);
            $table->integer('sort_order')->default(0);
            $table->timestamps();
        });

        Schema::create('bookings', function (Blueprint $table) {
            $table->id();
            $table->bigInteger('property_id');
            $table->bigInteger('user_id');
            $table->date('check_in');
            $table->date('check_out');
            $table->integer('guests');
            $table->decimal('total_price', 10, 2);
            $table->string('status', 255);
            $table->text('booking_metadata')->nullable();
            $table->timestamp('created_at')->nullable();
            $table->timestamp('updatedAt')->nullable();
        });

        Schema::create('reviews', function (Blueprint $table) {
            $table->id();
            $table->bigInteger('property_id');
            $table->bigInteger('user_id');
            $table->bigInteger('booking_id')->nullable();
            $table->integer('rating');
            $table->text('comment');
            $table->timestamps();
        });

        Schema::create('payments', function (Blueprint $table) {
            $table->id();
            $table->bigInteger('booking_id');
            $table->decimal('amount', 10, 2);
            $table->string('status', 255);
            $table->timestamp('created_at')->nullable();
        });

        Schema::create('notifications', function (Blueprint $table) {
            $table->id();
            $table->bigInteger('user_id');
            $table->string('type', 255);
            $table->text('data');
            $table->timestamp('created_at')->nullable();
            $table->integer('read')->default(0);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('notifications');
        Schema::dropIfExists('payments');
        Schema::dropIfExists('reviews');
        Schema::dropIfExists('bookings');
        Schema::dropIfExists('property_images');
        Schema::dropIfExists('properties');
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['company_id', 'company_tier', 'is_manager']);
        });
        Schema::dropIfExists('companies');
    }
};
