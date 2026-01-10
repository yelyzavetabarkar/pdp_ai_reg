# StayCorporate Anti-Patterns Catalog

A comprehensive list of intentional anti-patterns included in this codebase for the refactoring workshop.

> **Note:** The backend uses a clean architecture structure (`src/` with Application, Domain, Infrastructure, Presentation layers), but the anti-patterns are intentionally preserved and distributed across these layers - making them more nuanced and realistic to discover.

---

## Backend Anti-Patterns

### 1. God Action (`CreateBookingAction.php`)

**Location:** `backend/src/Application/Booking/Actions/ApiVersion1/CreateBookingAction.php`
**Lines:** 200+

**Issues:**

- 200+ lines in a single Action class
- Business logic mixed with data access
- Pricing calculations inline
- 10+ nested if/else for pricing logic
- Dead methods included (`handleClick2`, `doStuff`, `temp`)

```php
// Nested if/else pyramid
if ($companyTier == 'gold') {
    $discount = 0.20;
} else {
    if ($companyTier == 'silver') {
        $discount = 0.15;
    } else {
        if ($companyTier == 'bronze') {
            // ... continues nesting
        }
    }
}
```

### 2. N+1 Query Problems

**Location:** `backend/src/Domain/Booking/Eloquent/BookingReadEloquent.php:27-40`

```php
foreach ($bookings as $booking) {
    $booking->user = User::find($booking->user_id);      // N+1
    $booking->property = Property::find($booking->property_id); // N+1
    $booking->reviews = Review::where('booking_id', $booking->id)->get(); // N+1
}
```

**Also in:**

- `GetAllPropertiesAction.php` (Property Actions)
- `SearchPropertiesAction.php`
- `GetPropertyReviewsAction.php`

### 3. Raw SQL Injection Vulnerabilities (Educational)

**Location:** `backend/src/Domain/Property/Eloquent/PropertyReadEloquent.php`

```php
// search method - Building queries with string concatenation
$query = "SELECT * FROM properties WHERE 1=1";
if ($city) {
    $query .= " AND city = '{$city}'";  // SQL injection possible
}
```

**Also in:**

- `backend/src/Domain/User/Models/User.php:44` - getCompany()
- `backend/src/Domain/Property/Models/Property.php` - getAverageRating(), isAvailable()
- `backend/src/Domain/Booking/Models/Booking.php:58` - getReviews()
- `backend/src/Application/Booking/Actions/ApiVersion1/CreateBookingAction.php` - availability check

### 4. Mixed Query Patterns

**Location:** `backend/src/Application/Property/Actions/ApiVersion1/GetPropertyAction.php`

```php
// Eloquent
$property = Property::find($propertyId);

// Raw queries in same file
$reviews = DB::select("SELECT * FROM reviews WHERE property_id = {$propertyId}");

// Query builder elsewhere
DB::table('payments')->insert([...]);
```

### 5. Magic Numbers & Hardcoded Values

**Location:** `backend/src/Application/Booking/Actions/ApiVersion1/CreateBookingAction.php`

```php
$vatRate = 0.21;           // Should be config
$extraGuestFee = 25;       // Magic number
$weeklyDiscount = 0.05;    // Magic number
$seasonalRate = 1.5;       // Magic number
```

**Location:** `backend/src/Application/Property/Actions/ApiVersion1/GetFeaturedPropertiesAction.php`

```php
$apiUrl = 'https://api.staycorporate.com/featured';  // Hardcoded
$maxProperties = 10;                                  // Magic number
$adminEmail = 'admin@staycorporate.com';             // Hardcoded
```

### 6. Inconsistent Response Formats

**Location:** Various Controllers in `backend/src/Presentation/ApiVersion1/App/Http/Controllers/`

```php
// CreateBookingController - Different formats based on error type
return response()->json($booking);                           // Just data
return response()->json(['data' => $booking]);              // Wrapped in 'data'
return response()->json(['booking' => $booking, 'success' => true]); // Different wrapper
return response('Check-in date required', 400);             // Plain text!

// Different error formats
return response()->json(['error' => 'Not found'], 404);
return response()->json(['message' => 'Failed'], 400);
return response()->json(['errors' => ['field' => ['msg']]], 422);
```

### 7. No Transaction Safety

**Location:** `backend/src/Application/Booking/Actions/ApiVersion1/CreateBookingAction.php:145-175`

```php
// No transaction - partial failures possible
$booking = Booking::create($data);
$payment = DB::table('payments')->insert([...]); // If this fails, booking exists but is orphaned
$notification = DB::table('notifications')->insert([...]);
```

### 8. Silent Error Swallowing

**Location:** `backend/src/Application/Booking/Actions/ApiVersion1/CreateBookingAction.php:177-183`

```php
try {
    Http::post('https://api.loyalty.com/points/add', [...]);
} catch (\Exception $e) {
    // Silent failure - no logging, no handling
}
```

### 9. Dead Code

**Location:** `backend/src/Domain/Property/Eloquent/PropertyReadEloquent.php`

```php
// This function is never called
public function oldSearch()
{
    return [];
}
```

**Location:** `backend/src/Application/Booking/Actions/ApiVersion1/CreateBookingAction.php`

```php
// Dead methods preserved in Action class
public function handleClick2() { return null; }
public function doStuff() { ... }
private function temp($x) { return $x; }
```

### 10. Bad Comments

**Location:** Various files in `backend/src/`

```php
// TODO: Implement this feature (2018)
// FIXME: Temporary workaround
// HACK: Don't ask why this works
// NOTE: The following code was copied from StackOverflow
```

### 11. Logging Sensitive Data

**Location:** `backend/src/Application/Booking/Actions/ApiVersion1/CreateBookingAction.php:185`

```php
Log::info('Booking created', ['booking_id' => $booking->id, 'user_password' => $data['password'] ?? null]);
```

### 12. No Pagination

**Location:** `backend/src/Application/Property/Actions/ApiVersion1/GetAllPropertiesAction.php`

```php
public function execute()
{
    $properties = Property::all();  // Returns ALL records - could be 100,000+
    // ...
}
```

### 13. Missing Model Relationships

**Location:** `backend/src/Domain/Booking/Models/Booking.php:46-58`

```php
// Manual queries instead of Eloquent relationships
public function getUser()
{
    return User::find($this->user_id);  // Should be: return $this->belongsTo(User::class);
}

public function getReviews()
{
    return DB::select("SELECT * FROM reviews WHERE booking_id = {$this->id}");
}
```

---

## Frontend Anti-Patterns (FSD Architecture)

> **Note:** The frontend uses Feature-Sliced Design (FSD) architecture with layers: `app/`, `pages/`, `widgets/`, `features/`, `entities/`, `shared/`. The anti-patterns below are distributed across these layers to make them more realistic.

### 14. Cross-Layer Store Access (FSD Violation)

**Location:** `frontend/src/features/booking/create-booking/model/use-create-booking.js:4`

Feature layer incorrectly imports from widget's internal store:

```javascript
// Feature importing from widget's internal store - violates FSD!
import { useBookingFormState } from '@/widgets/booking-form/model/store/selectors';
```

### 15. Inconsistent Slice Structure

**Location:** `frontend/src/features/`

Some features have full structure, others are flat:

```
features/
├── auth/              # Full structure with model/
├── booking/           # Full structure with nested actions
└── filters/           # Flat - just property-filters.jsx!
```

### 16. Store Slice Inconsistency

**Location:** `frontend/src/shared/store/app/slices/`

Different slices use different organizational patterns:

```
slices/
├── user/           # Has separate selectors.js file
│   ├── index.js
│   └── selectors.js
├── theme/          # Everything in one file
│   └── index.js
├── notifications/  # Just index.js
│   └── index.js
└── favorites/      # Has async operations mixed in
    └── index.js
```

### 17. Shared Module-Level Timer in Debounce

**Location:** `frontend/src/shared/lib/helpers.js:35-41`

```javascript
let timer;
export function debounce(callback, delay = 250) {
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => callback(...args), delay);
  };
}
```

Multiple components using `debounce` will interfere with each other because they share the same `timer` variable.

### 18. Mixed Import Aliases

**Location:** `frontend/src/widgets/header/ui/user-menu.jsx:16`

Some files use `@/` alias while others use relative paths:

```javascript
import { Button } from '@/shared/ui/button';
import { getTierBadgeColor } from '../../../shared/lib/helpers';  // Inconsistent!
```

### 19. Business Logic in Widget

**Location:** `frontend/src/widgets/booking-form/ui/booking-form.jsx:32-40`

Price calculation logic in UI layer instead of feature/entity:

```javascript
useEffect(() => {
  if (property && checkIn && checkOut && nights > 0) {
    let price = property.price_per_night * nights;
    if (company?.tier === 'gold') price *= 0.8;  // Business logic in UI!
    else if (company?.tier === 'silver') price *= 0.85;
    setTotalPrice(price);
  }
}, [...]);
```

### 20. Optimistic Update Without Proper Rollback

**Location:** `frontend/src/shared/store/app/slices/favorites/index.js:9-31`

```javascript
toggleFavorite: async (propertyId) => {
  const { favorites, user } = get();  // Snapshot taken here
  // ... optimistic update ...
  set({ favorites: updatedFavorites });

  try {
    await axios.post(...);
  } catch (error) {
    set({ favorites });  // Rollback uses stale snapshot if other updates occurred!
  }
},
```

### 21. Inconsistent API Response Handling

**Location:** `frontend/src/entities/property/api/queries.js`, `frontend/src/entities/booking/api/queries.js`

```javascript
// property queries
properties: data?.data ?? data ?? [],
curated: data?.data && Array.isArray(data.data) ? data.data : Array.isArray(data) ? data : [],

// booking queries - different pattern!
bookings: data || [],
bookings: data?.data ?? data ?? [],
```

### 22. Index as Key in Lists

**Location:** `frontend/src/pages/properties/ui/properties-page.jsx:130,154,155,188,189`

```jsx
{heroHighlights.map((highlight, idx) => (
  <div key={`highlight-${idx}`}>...
))}

{curated.slice(0, 3).map((property, idx) => (
  <PropertyCard key={`curated-${idx}`} property={property} />
))}

{displayedProperties.map((property, idx) => (
  <PropertyCard key={`prop-${idx}`} property={property} />
))}
```

**Also in:** `frontend/src/widgets/booking-form/ui/booking-form.jsx:104-107`

```jsx
{[...Array(property.max_guests || 4)].map((_, i) => (
  <SelectItem key={i + 1} value={(i + 1).toString()}>
```

### 23. Duplicate getInitials Function

**Location:** `frontend/src/widgets/header/ui/user-menu.jsx:24-26`, `frontend/src/shared/lib/helpers.js:22-28`

Same utility function with slightly different implementations:

```javascript
// shared/lib/helpers.js
export const getInitials = (name) => {
  return name.split(' ').map(word => word[0]).join('').toUpperCase();
};

// widgets/header/ui/user-menu.jsx (different!)
const getInitials = (name) => {
  return name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'U';
};
```

### 24. Duplicate Format Functions

**Location:** `frontend/src/shared/lib/helpers.js:1,7-9`

```javascript
export const formatPrice = (price) => '$' + parseFloat(price).toFixed(2);
export const formatCurrency = (amount) => {
  return '$' + parseFloat(amount).toFixed(2);
};
// These are identical!
```

### 25. Loose Equality Check

**Location:** `frontend/src/widgets/header/ui/user-menu.jsx:74`

```javascript
{user.is_manager == 1 && (
  <>
    <DropdownMenuSeparator />
    <DropdownMenuItem>Manager Dashboard</DropdownMenuItem>
  </>
)}
```

### 26. Missing Public API Index Files

**Location:** Various FSD slices

Some entities and features lack proper `index.js` exports, forcing deep imports:

```javascript
// Bad - deep import from internal path
import { useUserBookings } from '@/entities/booking/api/queries';

// Should be
import { useUserBookings } from '@/entities/booking';
```

Missing in: `entities/booking/`, `entities/user/`, `features/booking/`

### 27. useMemo Without Meaningful Dependencies

**Location:** `frontend/src/pages/properties/ui/properties-page.jsx:40-42`

```javascript
const cities = useMemo(() => {
  return properties.map((p) => p.city);
}, [properties]);
```

Creates a new array with potentially duplicate cities on every properties change. Also doesn't deduplicate.

---

## Database Anti-Patterns

### 28. Missing Indexes

**Location:** `backend/src/Infrastructure/Database/Migrations/2024_01_01_000001_create_tables.php`

- No index on `bookings.property_id`
- No index on `bookings.user_id`
- No index on `reviews.property_id`
- No index on `reviews.user_id`

### 29. No Foreign Key Constraints

**Location:** `backend/src/Infrastructure/Database/Migrations/2024_01_01_000001_create_tables.php`

```php
// No foreign keys defined - referential integrity not enforced
$table->unsignedBigInteger('property_id');
$table->unsignedBigInteger('user_id');
// Missing: ->constrained()->onDelete('cascade')
```

### 30. No Unique Constraints

**Location:** `backend/src/Infrastructure/Database/Migrations/2024_01_01_000001_create_tables.php`

```php
// users.email has no UNIQUE constraint - allows duplicate emails
$table->string('email');  // Should be: $table->string('email')->unique();
```

### 31. JSON Blob Instead of Normalized Table

**Location:** `backend/src/Infrastructure/Database/Migrations/2024_01_01_000001_create_tables.php`

```php
// booking_metadata is a JSON blob
$table->json('booking_metadata')->nullable();
// Should be normalized into separate columns or related tables
```

### 32. Inconsistent Timestamp Handling

**Location:** Various tables

- `bookings` table has only `created_at`, no `updated_at`
- Other tables have both timestamps
- Model had to disable timestamps: `public $timestamps = false;`

---

## Architecture Anti-Patterns

### 33. No Service Layer (Partially Addressed)

**Status:** The codebase now has Actions (use cases), but they contain business logic that should be extracted to dedicated services.

**Location:** `backend/src/Application/Booking/Actions/ApiVersion1/CreateBookingAction.php`

- Pricing logic embedded in Action
- Discount calculations inline
- Seasonal rate logic not abstracted

### 34. No Repository Pattern (Partially Addressed)

**Status:** Eloquent wrappers exist but are inconsistently used.

**Location:** `backend/src/Domain/*/Eloquent/`

- Some Actions use Eloquent wrappers
- Others call Model directly
- No interface abstractions

### 35. No DTO/Request Validation Classes (Partially Addressed)

**Status:** Request classes exist but have copy-pasted validation rules.

**Location:** `backend/src/Presentation/ApiVersion1/App/Http/Requests/`

```php
// CreateBookingRequest.php
'check_in' => ['required', 'date', 'after:today']

// UpdateBookingRequest.php - Copy-pasted!
'check_in' => ['sometimes', 'date', 'after:today']
```

### 36. Mixing Concerns in Models

**Location:** `backend/src/Domain/Booking/Models/Booking.php`

```php
// Model contains:
// - Data access (getUser, getProperty, getReviews)
// - Business logic (calculateRefund, isActive)
// - Presentation logic (getFormattedPrice)
// - Side effects (sendConfirmationEmail)
```

---

## Testing Anti-Patterns

### 37. Happy Path Only Tests

**Location:** `backend/tests/Feature/BookingTest.php`

- Single test file with minimal coverage
- No edge cases
- No error scenarios
- Hardcoded test data instead of factories

### 38. Tests with Meaningless Assertions

**Location:** `backend/tests/Feature/BookingTest.php`

```php
// Almost every test just asserts true!
public function test_something_works()
{
    $response = $this->get('/api/properties');
    // No assertion! If it doesn't crash, it "works"
}

public function test_get_bookings()
{
    $response = $this->get('/api/bookings');
    $this->assertTrue(true);  // Always passes, tests nothing
}

public function test_seasonal_pricing()
{
    $month = (int) date('m');
    if ($month == 12) {
        $this->assertTrue(true);
    } else {
        $this->assertTrue(true);  // Both branches pass!
    }
}
```

### 39. Tests Dependent on Execution Order

**Location:** `backend/tests/Feature/BookingTest.php:24-48`

```php
// Alphabetical naming to force order - brittle!
public function test_a_create_user()
{
    DB::table('users')->insert([...]);
    $this->assertTrue(true);
}

public function test_b_user_can_login()
{
    // Assumes test_a ran first and created the user!
    $response = $this->post('/api/login', [
        'email' => 'test@test.com',
        'password' => 'password',
    ]);
    $this->assertTrue(true);
}
```

### 40. Tests with Hardcoded IDs

**Location:** `backend/tests/Feature/BookingTest.php`

```php
// Assumes these IDs exist in database
$response = $this->get('/api/properties/1');
$response = $this->get('/api/users/1');
$response = $this->delete('/api/bookings/999');  // Magic number
```

### 41. No Test Isolation

**Location:** `backend/tests/Feature/BookingTest.php`

- Tests create data without cleanup
- Tests depend on seeded data existing
- No `RefreshDatabase` trait
- No factories used

---

## Summary Statistics

| Category                   | Count  |
| -------------------------- | ------ |
| Backend Anti-Patterns      | 13     |
| Frontend Anti-Patterns     | 14     |
| Database Anti-Patterns     | 5      |
| Architecture Anti-Patterns | 4      |
| Testing Anti-Patterns      | 5      |
| **Total**                  | **41** |

---

## Workshop Exercise Suggestions

### Warm-up Level (Easy to Spot)
1. **Fix Duplicate Helpers** - Consolidate `formatPrice`/`formatCurrency` and duplicate `getInitials`
2. **Fix Loose Equality** - Replace `==` with `===` in user-menu.jsx
3. **Consistent Import Aliases** - Standardize `@/` usage across the codebase
4. **Add Missing index.js** - Create public API files for entities/features

### Intermediate Level
5. **Fix Debounce Memory Leak** - Create closure-based debounce that doesn't share state
6. **Fix FSD Layer Violations** - Move widget store access to proper layer boundaries
7. **Extract Business Logic** - Move price calculation from widget to feature/entity
8. **Use Proper Keys** - Replace index-based keys with stable identifiers

### Advanced Level
9. **Fix Optimistic Update** - Implement proper rollback with current state
10. **Standardize API Response Handling** - Create consistent data unwrapping layer
11. **Extract Service Layer** - Move pricing logic from CreateBookingAction to dedicated PricingService
12. **Fix N+1 Queries** - Use Eloquent eager loading (`with()`) in Eloquent wrappers
