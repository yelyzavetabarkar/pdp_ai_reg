<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        DB::table('companies')->insert([
            ['id' => 1, 'name' => 'Acme Corporation', 'tier' => 'gold', 'address' => '123 Business Ave, New York', 'created_at' => now(), 'updated_at' => now()],
            ['id' => 2, 'name' => 'TechStart Inc', 'tier' => 'silver', 'address' => '456 Innovation Blvd, San Francisco', 'created_at' => now(), 'updated_at' => now()],
            ['id' => 3, 'name' => 'Global Traders', 'tier' => 'bronze', 'address' => '789 Commerce St, Chicago', 'created_at' => now(), 'updated_at' => now()],
        ]);

        DB::table('users')->insert([
            ['id' => 1, 'name' => 'John Smith', 'email' => 'john@acme.com', 'password' => Hash::make('password123'), 'company_id' => 1, 'company_tier' => 'gold', 'is_manager' => 1, 'created_at' => now(), 'updated_at' => now()],
            ['id' => 2, 'name' => 'Sarah Johnson', 'email' => 'sarah@acme.com', 'password' => Hash::make('password'), 'company_id' => 1, 'company_tier' => 'gold', 'is_manager' => 0, 'created_at' => now(), 'updated_at' => now()],
            ['id' => 3, 'name' => 'Mike Chen', 'email' => 'mike@techstart.com', 'password' => Hash::make('password'), 'company_id' => 2, 'company_tier' => 'silver', 'is_manager' => 1, 'created_at' => now(), 'updated_at' => now()],
            ['id' => 4, 'name' => 'Emily Brown', 'email' => 'emily@techstart.com', 'password' => Hash::make('password'), 'company_id' => 2, 'company_tier' => 'silver', 'is_manager' => 0, 'created_at' => now(), 'updated_at' => now()],
            ['id' => 5, 'name' => 'David Wilson', 'email' => 'david@global.com', 'password' => Hash::make('password'), 'company_id' => 3, 'company_tier' => 'bronze', 'is_manager' => 1, 'created_at' => now(), 'updated_at' => now()],
            ['id' => 6, 'name' => 'Lisa Anderson', 'email' => 'lisa@global.com', 'password' => Hash::make('password'), 'company_id' => 3, 'company_tier' => 'bronze', 'is_manager' => 0, 'created_at' => now(), 'updated_at' => now()],
            ['id' => 7, 'name' => 'James Taylor', 'email' => 'james@acme.com', 'password' => Hash::make('password'), 'company_id' => 1, 'company_tier' => 'gold', 'is_manager' => 0, 'created_at' => now(), 'updated_at' => now()],
            ['id' => 8, 'name' => 'Amanda Lee', 'email' => 'amanda@techstart.com', 'password' => Hash::make('password'), 'company_id' => 2, 'company_tier' => 'silver', 'is_manager' => 0, 'created_at' => now(), 'updated_at' => now()],
            ['id' => 9, 'name' => 'Robert Martinez', 'email' => 'robert@global.com', 'password' => Hash::make('password'), 'company_id' => 3, 'company_tier' => 'bronze', 'is_manager' => 0, 'created_at' => now(), 'updated_at' => now()],
            ['id' => 10, 'name' => 'Jennifer White', 'email' => 'jennifer@acme.com', 'password' => Hash::make('password'), 'company_id' => 1, 'company_tier' => 'gold', 'is_manager' => 0, 'created_at' => now(), 'updated_at' => now()],
        ]);

        DB::table('properties')->insert([
            ['id' => 1, 'name' => 'Grand Business Hotel', 'description' => 'Luxury hotel in the heart of Manhattan with stunning city views and world-class amenities.', 'address' => '350 5th Avenue', 'city' => 'New York', 'price_per_night' => 299.00, 'max_guests' => 4, 'amenities' => '["wifi","parking","gym","pool","restaurant","bar","spa"]', 'image_url' => 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800', 'created_at' => now(), 'updated_at' => now()],
            ['id' => 2, 'name' => 'Tech Hub Suites', 'description' => 'Modern suites perfect for tech professionals, featuring high-speed internet and co-working spaces.', 'address' => '100 Market Street', 'city' => 'San Francisco', 'price_per_night' => 249.00, 'max_guests' => 2, 'amenities' => '["wifi","coworking","gym","coffee"]', 'image_url' => 'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=800', 'created_at' => now(), 'updated_at' => now()],
            ['id' => 3, 'name' => 'Executive Tower', 'description' => 'Premium accommodations for business executives with meeting rooms and concierge services.', 'address' => '200 Michigan Ave', 'city' => 'Chicago', 'price_per_night' => 329.00, 'max_guests' => 3, 'amenities' => '["wifi","parking","gym","meeting_rooms","concierge"]', 'image_url' => 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800', 'created_at' => now(), 'updated_at' => now()],
            ['id' => 4, 'name' => 'Skyline Apartments', 'description' => 'Spacious serviced apartments with full kitchens, ideal for extended stays.', 'address' => '500 Brickell Ave', 'city' => 'Miami', 'price_per_night' => 189.00, 'max_guests' => 6, 'amenities' => '["wifi","parking","pool","kitchen","laundry"]', 'image_url' => 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800', 'created_at' => now(), 'updated_at' => now()],
            ['id' => 5, 'name' => 'Harbor View Inn', 'description' => 'Charming waterfront hotel with beautiful harbor views and seafood restaurant.', 'address' => '1 Harbor Drive', 'city' => 'Boston', 'price_per_night' => 219.00, 'max_guests' => 2, 'amenities' => '["wifi","restaurant","bar","water_view"]', 'image_url' => 'https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=800', 'created_at' => now(), 'updated_at' => now()],
            ['id' => 6, 'name' => 'Downtown Lofts', 'description' => 'Industrial-chic lofts in a renovated warehouse with exposed brick and high ceilings.', 'address' => '300 Pearl Street', 'city' => 'Austin', 'price_per_night' => 159.00, 'max_guests' => 4, 'amenities' => '["wifi","parking","gym","rooftop"]', 'image_url' => 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800', 'created_at' => now(), 'updated_at' => now()],
            ['id' => 7, 'name' => 'Pacific Business Center', 'description' => 'Full-service business hotel with conference facilities and airport shuttle.', 'address' => '800 Airport Blvd', 'city' => 'Seattle', 'price_per_night' => 199.00, 'max_guests' => 2, 'amenities' => '["wifi","parking","gym","shuttle","conference"]', 'image_url' => 'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?w=800', 'created_at' => now(), 'updated_at' => now()],
            ['id' => 8, 'name' => 'Mountain Retreat Lodge', 'description' => 'Peaceful mountain lodge perfect for corporate retreats and team building.', 'address' => '1200 Summit Road', 'city' => 'Denver', 'price_per_night' => 279.00, 'max_guests' => 8, 'amenities' => '["wifi","parking","restaurant","hiking","conference"]', 'image_url' => 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800', 'created_at' => now(), 'updated_at' => now()],
            ['id' => 9, 'name' => 'Central Station Hotel', 'description' => 'Historic hotel near the train station with classic elegance and modern comfort.', 'address' => '50 Station Square', 'city' => 'Philadelphia', 'price_per_night' => 169.00, 'max_guests' => 2, 'amenities' => '["wifi","restaurant","bar","historic"]', 'image_url' => 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800', 'created_at' => now(), 'updated_at' => now()],
            ['id' => 10, 'name' => 'Innovation Campus Suites', 'description' => 'Modern suites adjacent to the tech campus with smart room features.', 'address' => '2000 Innovation Way', 'city' => 'San Jose', 'price_per_night' => 229.00, 'max_guests' => 2, 'amenities' => '["wifi","gym","smart_room","ev_charging"]', 'image_url' => 'https://images.unsplash.com/photo-1590490360182-c33d57733427?w=800', 'created_at' => now(), 'updated_at' => now()],
            ['id' => 11, 'name' => 'The Ritz Corporate', 'description' => 'Ultra-luxury accommodations with butler service and private meeting suites for C-level executives.', 'address' => '15 Central Park West', 'city' => 'New York', 'price_per_night' => 599.00, 'max_guests' => 4, 'amenities' => '["wifi","parking","spa","butler","concierge","restaurant"]', 'image_url' => 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=800', 'created_at' => now(), 'updated_at' => now()],
            ['id' => 12, 'name' => 'SoMa Startup Lofts', 'description' => 'Hip converted warehouse spaces with 24/7 coworking, perfect for startup teams on the move.', 'address' => '888 Brannan Street', 'city' => 'San Francisco', 'price_per_night' => 179.00, 'max_guests' => 6, 'amenities' => '["wifi","coworking","coffee","bike_storage"]', 'image_url' => 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800', 'created_at' => now(), 'updated_at' => now()],
            ['id' => 13, 'name' => 'Lakefront Conference Center', 'description' => 'Premier venue for corporate events with panoramic lake views and state-of-the-art AV equipment.', 'address' => '401 E Wacker Drive', 'city' => 'Chicago', 'price_per_night' => 389.00, 'max_guests' => 10, 'amenities' => '["wifi","parking","conference","restaurant","water_view"]', 'image_url' => 'https://images.unsplash.com/photo-1455587734955-081b22074882?w=800', 'created_at' => now(), 'updated_at' => now()],
            ['id' => 14, 'name' => 'Ocean Drive Boutique', 'description' => 'Art deco gem on iconic Ocean Drive with rooftop pool and vibrant nightlife access.', 'address' => '1220 Ocean Drive', 'city' => 'Miami', 'price_per_night' => 259.00, 'max_guests' => 2, 'amenities' => '["wifi","pool","bar","rooftop","beach_access"]', 'image_url' => 'https://images.unsplash.com/photo-1445019980597-93fa8acb246c?w=800', 'created_at' => now(), 'updated_at' => now()],
            ['id' => 15, 'name' => 'Cambridge Academic Inn', 'description' => 'Scholarly retreat near Harvard and MIT, ideal for visiting professors and research teams.', 'address' => '44 Brattle Street', 'city' => 'Boston', 'price_per_night' => 189.00, 'max_guests' => 2, 'amenities' => '["wifi","library","coffee","quiet_hours"]', 'image_url' => 'https://images.unsplash.com/photo-1618773928121-c32242e63f39?w=800', 'created_at' => now(), 'updated_at' => now()],
            ['id' => 16, 'name' => 'Music Row Studios', 'description' => 'Creative spaces for entertainment industry professionals with recording studio access.', 'address' => '16 Music Square East', 'city' => 'Nashville', 'price_per_night' => 145.00, 'max_guests' => 3, 'amenities' => '["wifi","parking","studio","coffee"]', 'image_url' => 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800', 'created_at' => now(), 'updated_at' => now()],
            ['id' => 17, 'name' => 'Space Needle View Hotel', 'description' => 'Iconic Seattle views with eco-friendly amenities and farm-to-table dining.', 'address' => '400 Broad Street', 'city' => 'Seattle', 'price_per_night' => 269.00, 'max_guests' => 4, 'amenities' => '["wifi","restaurant","gym","ev_charging","city_view"]', 'image_url' => 'https://images.unsplash.com/photo-1596436889106-be35e843f974?w=800', 'created_at' => now(), 'updated_at' => now()],
            ['id' => 18, 'name' => 'Red Rocks Executive Lodge', 'description' => 'Stunning mountain retreat with easy access to outdoor adventures and wellness programs.', 'address' => '18300 W Alameda Pkwy', 'city' => 'Denver', 'price_per_night' => 319.00, 'max_guests' => 6, 'amenities' => '["wifi","parking","spa","hiking","yoga"]', 'image_url' => 'https://images.unsplash.com/photo-1470075801209-17f9ec0each6?w=800', 'created_at' => now(), 'updated_at' => now()],
            ['id' => 19, 'name' => 'Liberty Bell Suites', 'description' => 'Historic charm meets modern comfort in the heart of Old City Philadelphia.', 'address' => '6th & Chestnut Streets', 'city' => 'Philadelphia', 'price_per_night' => 149.00, 'max_guests' => 2, 'amenities' => '["wifi","historic","restaurant","bar"]', 'image_url' => 'https://images.unsplash.com/photo-1551918120-9739cb430c6d?w=800', 'created_at' => now(), 'updated_at' => now()],
            ['id' => 20, 'name' => 'Silicon Valley Executive', 'description' => 'Premium suites with private offices and direct access to Sand Hill Road investors.', 'address' => '3000 Sand Hill Road', 'city' => 'San Jose', 'price_per_night' => 349.00, 'max_guests' => 2, 'amenities' => '["wifi","parking","meeting_rooms","concierge","ev_charging"]', 'image_url' => 'https://images.unsplash.com/photo-1587381420270-3e1a5b9e6904?w=800', 'created_at' => now(), 'updated_at' => now()],
            ['id' => 21, 'name' => 'Hollywood Hills Retreat', 'description' => 'Private villa with stunning canyon views, perfect for entertainment industry retreats.', 'address' => '2800 Mulholland Drive', 'city' => 'Los Angeles', 'price_per_night' => 449.00, 'max_guests' => 8, 'amenities' => '["wifi","parking","pool","gym","city_view"]', 'image_url' => 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800', 'created_at' => now(), 'updated_at' => now()],
            ['id' => 22, 'name' => 'Downtown LA Lofts', 'description' => 'Trendy converted industrial spaces in the Arts District with gallery access.', 'address' => '520 Mateo Street', 'city' => 'Los Angeles', 'price_per_night' => 189.00, 'max_guests' => 4, 'amenities' => '["wifi","parking","rooftop","coffee"]', 'image_url' => 'https://images.unsplash.com/photo-1560185007-cde436f6a4d0?w=800', 'created_at' => now(), 'updated_at' => now()],
            ['id' => 23, 'name' => 'Gaslamp Quarter Hotel', 'description' => 'Vibrant downtown location with easy access to convention center and nightlife.', 'address' => '660 K Street', 'city' => 'San Diego', 'price_per_night' => 199.00, 'max_guests' => 2, 'amenities' => '["wifi","gym","bar","restaurant"]', 'image_url' => 'https://images.unsplash.com/photo-1566665797739-1674de7a421a?w=800', 'created_at' => now(), 'updated_at' => now()],
            ['id' => 24, 'name' => 'La Jolla Seaside Resort', 'description' => 'Oceanfront luxury with private beach access and world-class spa services.', 'address' => '7955 La Jolla Shores Dr', 'city' => 'San Diego', 'price_per_night' => 379.00, 'max_guests' => 4, 'amenities' => '["wifi","parking","spa","pool","beach_access","restaurant"]', 'image_url' => 'https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?w=800', 'created_at' => now(), 'updated_at' => now()],
            ['id' => 25, 'name' => 'Pearl District Studios', 'description' => 'Artsy boutique accommodations surrounded by galleries, breweries, and foodie hotspots.', 'address' => '1001 NW Lovejoy Street', 'city' => 'Portland', 'price_per_night' => 139.00, 'max_guests' => 2, 'amenities' => '["wifi","coffee","bike_storage"]', 'image_url' => 'https://images.unsplash.com/photo-1598928506311-c55ez633a2ab?w=800', 'created_at' => now(), 'updated_at' => now()],
            ['id' => 26, 'name' => 'Waterfront Business Hotel', 'description' => 'Modern hotel on the Willamette with excellent conference facilities and river views.', 'address' => '1510 SW Harbor Way', 'city' => 'Portland', 'price_per_night' => 219.00, 'max_guests' => 3, 'amenities' => '["wifi","parking","conference","gym","water_view"]', 'image_url' => 'https://images.unsplash.com/photo-1563911302283-d2bc129e7570?w=800', 'created_at' => now(), 'updated_at' => now()],
            ['id' => 27, 'name' => 'Strip View Suites', 'description' => 'Luxury high-rise with panoramic views of the Las Vegas Strip and 24/7 concierge.', 'address' => '3600 Las Vegas Blvd', 'city' => 'Las Vegas', 'price_per_night' => 289.00, 'max_guests' => 4, 'amenities' => '["wifi","parking","pool","spa","casino","city_view"]', 'image_url' => 'https://images.unsplash.com/photo-1586611292717-f828b167408c?w=800', 'created_at' => now(), 'updated_at' => now()],
            ['id' => 28, 'name' => 'Convention Center Lodge', 'description' => 'Budget-friendly option steps from the convention center, perfect for trade shows.', 'address' => '201 E Flamingo Road', 'city' => 'Las Vegas', 'price_per_night' => 99.00, 'max_guests' => 2, 'amenities' => '["wifi","parking","shuttle","gym"]', 'image_url' => 'https://images.unsplash.com/photo-1590073242678-70ee3fc28f8e?w=800', 'created_at' => now(), 'updated_at' => now()],
            ['id' => 29, 'name' => 'Midtown Manhattan Micro', 'description' => 'Compact but clever rooms in prime Midtown location for budget-conscious travelers.', 'address' => '235 W 46th Street', 'city' => 'New York', 'price_per_night' => 149.00, 'max_guests' => 2, 'amenities' => '["wifi","gym","coffee"]', 'image_url' => 'https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=800', 'created_at' => now(), 'updated_at' => now()],
            ['id' => 30, 'name' => 'Tribeca Penthouse', 'description' => 'Exclusive penthouse suites with private terraces and celebrity-chef room service.', 'address' => '85 West Broadway', 'city' => 'New York', 'price_per_night' => 899.00, 'max_guests' => 6, 'amenities' => '["wifi","parking","spa","gym","restaurant","concierge","terrace"]', 'image_url' => 'https://images.unsplash.com/photo-1582719508461-905c673771fd?w=800', 'created_at' => now(), 'updated_at' => now()],
        ]);

        for ($i = 1; $i <= 30; $i++) {
            DB::table('property_images')->insert([
                ['property_id' => $i, 'url' => "https://images.unsplash.com/photo-156694587598{$i}?w=800", 'sort_order' => 1, 'created_at' => now(), 'updated_at' => now()],
                ['property_id' => $i, 'url' => "https://images.unsplash.com/photo-157048025026{$i}?w=800", 'sort_order' => 2, 'created_at' => now(), 'updated_at' => now()],
            ]);
        }

        $statuses = ['confirmed', 'pending', 'completed', 'cancelled'];
        for ($i = 1; $i <= 100; $i++) {
            $propertyId = rand(1, 30);
            $userId = rand(1, 10);
            $checkIn = now()->addDays(rand(-30, 60));
            $checkOut = $checkIn->copy()->addDays(rand(1, 7));
            $guests = rand(1, 4);
            $basePrice = DB::table('properties')->where('id', $propertyId)->value('price_per_night');
            $nights = $checkIn->diffInDays($checkOut);
            $totalPrice = $basePrice * $nights;

            DB::table('bookings')->insert([
                'property_id' => $propertyId,
                'user_id' => $userId,
                'check_in' => $checkIn->format('Y-m-d'),
                'check_out' => $checkOut->format('Y-m-d'),
                'guests' => $guests,
                'total_price' => $totalPrice,
                'status' => $statuses[array_rand($statuses)],
                'booking_metadata' => json_encode(['nights' => $nights, 'base_price' => $basePrice]),
                'created_at' => now()->subDays(rand(0, 60)),
            ]);
        }

        $comments = [
            'Amazing stay! Would definitely come back.',
            'Great location and friendly staff.',
            'Room was clean and comfortable.',
            'Excellent value for money.',
            'Perfect for business travel.',
            'Beautiful views and great amenities.',
            'The breakfast was outstanding.',
            'Very quiet and peaceful.',
            'Staff went above and beyond.',
            'Highly recommend for corporate stays.',
        ];

        for ($i = 1; $i <= 200; $i++) {
            DB::table('reviews')->insert([
                'property_id' => rand(1, 30),
                'user_id' => rand(1, 10),
                'booking_id' => rand(1, 100),
                'rating' => rand(3, 5),
                'comment' => $comments[array_rand($comments)],
                'created_at' => now()->subDays(rand(0, 90)),
                'updated_at' => now(),
            ]);
        }

        for ($i = 1; $i <= 100; $i++) {
            DB::table('payments')->insert([
                'booking_id' => $i,
                'amount' => DB::table('bookings')->where('id', $i)->value('total_price') ?? rand(100, 500),
                'status' => ['pending', 'completed', 'failed'][array_rand(['pending', 'completed', 'failed'])],
                'created_at' => now()->subDays(rand(0, 60)),
            ]);
        }
    }
}
