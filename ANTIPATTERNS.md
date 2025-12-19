# StayCorporate Anti-Patterns Catalog

A comprehensive list of intentional anti-patterns included in this codebase for the refactoring workshop.

---

## Backend Anti-Patterns

### 1. God Controller (`BookingController.php`)

**Location:** `backend/app/Http/Controllers/BookingController.php`
**Lines:** 400+

**Issues:**

- 400+ lines in a single controller
- Business logic mixed with data access
- No service layer extraction
- Pricing calculations inline (lines 92-165)
- 10+ nested if/else for pricing logic
- Copy-pasted validation across methods

```php
// Nested if/else pyramid - lines 97-117
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

**Location:** `backend/app/Http/Controllers/BookingController.php:28-35`

```php
foreach ($bookings as $booking) {
    $booking->user = User::find($booking->user_id);      // N+1
    $booking->property = Property::find($booking->property_id); // N+1
    $booking->reviews = Review::where('booking_id', $booking->id)->get(); // N+1
}
```

**Also in:**

- `PropertyController.php:16-24` (index method)
- `PropertyController.php:119-129` (search method)
- `PropertyController.php:138-141` (getReviews method)

### 3. Raw SQL Injection Vulnerabilities (Educational)

**Location:** `backend/app/Http/Controllers/PropertyController.php`

```php
// Line 37 - Direct variable interpolation
$reviews = DB::select("SELECT * FROM reviews WHERE property_id = {$id}");

// Line 103-115 - Building queries with string concatenation
$query = "SELECT * FROM properties WHERE 1=1";
if ($city) {
    $query .= " AND city = '{$city}'";  // SQL injection possible
}
```

**Also in:**

- `BookingController.php:167` - availability check
- `BookingController.php:264` - getByUser
- `BookingController.php:285` - getByProperty

### 4. Mixed Query Patterns

**Location:** `backend/app/Http/Controllers/PropertyController.php`

```php
// Eloquent
$properties = Property::all();

// Raw queries in same file
$reviews = DB::select("SELECT * FROM reviews WHERE property_id = {$id}");

// Query builder
DB::table('payments')->insert([...]);
```

### 5. Magic Numbers & Hardcoded Values

**Location:** `backend/app/Http/Controllers/BookingController.php`

```php
$vatRate = 0.21;           // Line 142 - Should be config
$extraGuestFee = 25;       // Line 162 - Magic number
$weeklyDiscount = 0.05;    // Line 147 - Magic number
$seasonalRate = 1.5;       // Line 121 - Magic number
```

**Location:** `backend/app/Http/Controllers/PropertyController.php`

```php
$apiUrl = 'https://api.staycorporate.com/featured';  // Line 161 - Hardcoded
$maxProperties = 10;                                  // Line 162 - Magic number
$adminEmail = 'admin@staycorporate.com';             // Line 163 - Hardcoded
```

### 6. Inconsistent Response Formats

**Location:** Various controllers

```php
// BookingController - Different formats
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

**Location:** `backend/app/Http/Controllers/BookingController.php:178-208`

```php
// No transaction - partial failures possible
$booking = Booking::create($data);
$payment = DB::table('payments')->insert([...]); // If this fails, booking exists but is orphaned
$notification = DB::table('notifications')->insert([...]);
```

### 8. Silent Error Swallowing

**Location:** `backend/app/Http/Controllers/BookingController.php:210-217`

```php
try {
    Http::post('https://api.loyalty.com/points/add', [...]);
} catch (\Exception $e) {
    // Silent failure - no logging, no handling
}
```

### 9. Dead Code

**Location:** `backend/app/Http/Controllers/PropertyController.php:175-179`

```php
// This function is never called
public function oldSearch()
{
    return [];
}
```

**Location:** `backend/app/Http/Controllers/BookingController.php:386-405`

```php
// Dead methods
public function handleClick2() { return null; }
public function doStuff() { ... }
private function temp($x) { return $x; }
```

### 10. Bad Comments

**Location:** Various files

```php
// TODO: Implement this feature (2018)
// FIXME: Temporary workaround
// HACK: Don't ask why this works
// NOTE: The following code was copied from StackOverflow
```

### 11. Logging Sensitive Data

**Location:** `backend/app/Http/Controllers/BookingController.php:219`

```php
Log::info('Booking created', ['booking_id' => $booking->id, 'user_password' => $request->input('password')]);
```

### 12. No Pagination

**Location:** `backend/app/Http/Controllers/PropertyController.php:12-27`

```php
public function index()
{
    $properties = Property::all();  // Returns ALL records - could be 100,000+
    // ...
}
```

### 13. Missing Model Relationships

**Location:** `backend/app/Models/Booking.php:44-57`

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

## Frontend Anti-Patterns

### 14. Waterfall useEffect Hooks

**Location:** `frontend/src/pages/property-details.jsx`

```jsx
useEffect(() => {
  fetchProperty();
}, []);
useEffect(() => {
  if (property) fetchReviews();
}, [property]);
useEffect(() => {
  if (reviews) fetchAvailability();
}, [reviews]);
```

**Also in:** `frontend/src/pages/profile.jsx:25-47`

```jsx
useEffect(() => {
  if (userId) fetchProfileData();
}, [userId]);
useEffect(() => {
  if (userId) fetchBookings();
}, [userId]);
useEffect(() => {
  if (userId) fetchReviews();
}, [userId]);
useEffect(() => {
  if (bookings.length > 0) calculateStats();
}, [bookings]);
```

**Also in:** `frontend/src/pages/manager-dashboard.jsx:33-51`

```jsx
useEffect(() => {
  if (user?.is_manager) fetchTeamMembers();
}, [user]);
useEffect(() => {
  if (teamMembers.length > 0) fetchPendingBookings();
}, [teamMembers]);
useEffect(() => {
  if (pendingBookings) fetchAllBookings();
}, [pendingBookings]);
useEffect(() => {
  if (allBookings.length > 0) calculateStats();
}, [allBookings]);
```

### 15. Prop Drilling (6+ Levels)

**Location:** `frontend/src/App.jsx` -> `header.jsx` -> `user-menu.jsx`

```jsx
// App.jsx passes to every component:
<Header
  user={user}
  settings={settings}
  theme={theme}
  setTheme={setTheme}
  onLogout={handleLogout}
  notifications={notifications}
  company={company}
  onMarkNotificationRead={handleMarkNotificationRead}
  onMarkAllNotificationsRead={handleMarkAllNotificationsRead}
/>

// Same props passed through PropertyList, PropertyDetails, BookingList, Settings, Profile, ManagerDashboard
```

### 16. Giant Flat Zustand Store

**Location:** `frontend/src/stores/use-app-store.js`

```javascript
const useAppStore = create((set) => ({
  user: null,
  properties: [],
  bookings: [],
  reviews: [],
  favorites: [],
  searchQuery: "",
  filters: {},
  selectedProperty: null,
  bookingDraft: null,
  notifications: [],
  theme: "dark",
  isLoading: false,
  error: null,
  companyData: null,
  // ... 20+ flat fields, no slices, no selectors
}));
```

### 17. Manual For Loops Instead of Array Methods

**Location:** `frontend/src/pages/profile.jsx:80-103`

```jsx
const calculateStats = () => {
  let totalSpent = 0;
  let totalNights = 0;
  let citiesVisited = [];

  for (let i = 0; i < bookings.length; i++) {
    const booking = bookings[i];
    totalSpent = totalSpent + parseFloat(booking.total_price || 0);
    // ... continues with manual iteration
  }
};
```

**Also in:** `frontend/src/pages/manager-dashboard.jsx:53-77, 79-95, 97-111`

### 18. Loose Equality Checks

**Location:** Various frontend files

```jsx
// profile.jsx:73
const userBookings = response.data.filter(b => b.user_id == userId);

// profile.jsx:149
const isOwnProfile = !id || id == user?.id;

// profile.jsx:166
{displayUser?.is_manager == 1 && (...)}

// manager-dashboard.jsx
if (u.company_id == user.company_id) { ... }
if (booking.status == 'pending') { ... }
```

### 19. Duplicate Utility Functions

**Location:** Multiple files have their own `getInitials` function

```jsx
// user-menu.jsx:18-25
const getInitials = (name) => { ... }

// profile.jsx:105-113
const getInitials = (name) => { ... }

// settings.jsx:36-43
const getInitials = (name) => { ... }

// manager-dashboard.jsx:158-166
const getInitials = (name) => { ... }
```

### 20. Inefficient Re-fetching

**Location:** `frontend/src/pages/manager-dashboard.jsx:131-142`

```jsx
const handleApprove = async (bookingId) => {
  await axios.put(`/api/bookings/${bookingId}`, { status: "confirmed" });
  // Refetches EVERYTHING instead of updating local state
  fetchTeamMembers(); // Triggers waterfall of all other fetches
};
```

### 21. No Error Boundaries

**Location:** `frontend/src/App.jsx`

- No React Error Boundaries anywhere in the app
- Errors crash the entire application

### 22. Console.log Debugging Left In

**Location:** Various files

```jsx
// profile.jsx:55, 66, 76
console.log("Error:", err);
console.log("Error fetching bookings:", err);

// manager-dashboard.jsx
console.log("Error:", err);
```

---

## Database Anti-Patterns

### 23. Missing Indexes

**Location:** `backend/database/migrations/create_tables.php`

- No index on `bookings.property_id`
- No index on `bookings.user_id`
- No index on `reviews.property_id`
- No index on `reviews.user_id`

### 24. No Foreign Key Constraints

**Location:** `backend/database/migrations/create_tables.php`

```php
// No foreign keys defined - referential integrity not enforced
$table->unsignedBigInteger('property_id');
$table->unsignedBigInteger('user_id');
// Missing: ->constrained()->onDelete('cascade')
```

### 25. No Unique Constraints

**Location:** `backend/database/migrations/create_tables.php`

```php
// users.email has no UNIQUE constraint - allows duplicate emails
$table->string('email');  // Should be: $table->string('email')->unique();
```

### 26. JSON Blob Instead of Normalized Table

**Location:** `backend/database/migrations/create_tables.php`

```php
// booking_metadata is a JSON blob
$table->json('booking_metadata')->nullable();
// Should be normalized into separate columns or related tables
```

### 27. Inconsistent Timestamp Handling

**Location:** Various tables

- `bookings` table has only `created_at`, no `updated_at`
- Other tables have both timestamps
- Model had to disable timestamps: `public $timestamps = false;`

---

## Architecture Anti-Patterns

### 28. No Service Layer

- All business logic in controllers
- No separation of concerns
- Controllers handle: validation, business logic, data access, formatting

### 29. No Repository Pattern

- Direct model calls in controllers
- No abstraction over data access
- Hard to test, hard to swap implementations

### 30. No DTO/Request Validation Classes

- Validation scattered across controller methods
- Inconsistent validation rules
- No type safety on request data

### 31. Mixing Concerns in Models

**Location:** `backend/app/Models/Booking.php`

```php
// Model contains:
// - Data access (getUser, getProperty, getReviews)
// - Business logic (calculateRefund, isActive)
// - Presentation logic (getFormattedPrice)
// - Side effects (sendConfirmationEmail)
```

---

## Testing Anti-Patterns

### 32. Happy Path Only Tests

**Location:** `backend/tests/Feature/BookingTest.php`

- Single test file with minimal coverage
- No edge cases
- No error scenarios
- Hardcoded test data instead of factories

---

### 33. Memory Leaks - No Cleanup

**Location:** `frontend/src/pages/property-details.jsx:49-53`

```jsx
useEffect(() => {
  fetchProperty();
  const interval = setInterval(pollAvailability, 30000); // Never cleared!
  window.addEventListener("resize", handleResize); // Never removed!
}, []); // No cleanup function returned
```

### 34. Using alert() for User Feedback

**Location:** `frontend/src/pages/property-details.jsx:146-151, 169`

```jsx
if (!user) {
  alert("Please login to book"); // Should use toast/modal
  return;
}
// ...
alert("Booking failed: " + (err.response?.data?.error || "Unknown error"));
```

### 35. Importing Entire Libraries

**Location:** `frontend/src/pages/property-details.jsx:4-6`

```jsx
import _ from "lodash"; // Imports entire 70kb library
import * as Utils from "../utils/helpers"; // Imports everything, tree-shaking impossible
```

### 36. 700+ Line Component Monolith

**Location:** `frontend/src/pages/property-details.jsx`

- 700+ lines in single component
- Multiple responsibilities: fetching, booking form, reviews, image gallery
- Should be split into smaller components

### 37. Duplicate Helper Functions

**Location:** `frontend/src/utils/helpers.js:1-3, 45-47, 60-66`

```javascript
// Same function defined multiple times!
export function formatPrice(price) {
  return "$" + parseFloat(price).toFixed(2);
}

export function formatCurrency(amount) {
  return "$" + parseFloat(amount).toFixed(2); // Same as formatPrice!
}

export function formatPrice2(price) {
  return "$" + parseFloat(price).toFixed(2); // Duplicate with number suffix
}

export function formatCurrency2(amount) {
  return "$" + parseFloat(amount).toFixed(2); // Another duplicate
}
```

### 38. Dead Code with Ancient TODOs

**Location:** `frontend/src/utils/helpers.js:68-76`

```javascript
// TODO: Remove this after Q2 launch (2019)  // 6 years old!
export function oldCalculation(a, b) {
  return a + b;
}

// FIXME: This is temporary
export function tempFunction() {
  return null;
}
```

### 39. Tests with Meaningless Assertions

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

### 40. Tests Dependent on Execution Order

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

### 41. Tests with Hardcoded IDs

**Location:** `backend/tests/Feature/BookingTest.php`

```php
// Assumes these IDs exist in database
$response = $this->get('/api/properties/1');
$response = $this->get('/api/users/1');
$response = $this->delete('/api/bookings/999');  // Magic number
```

### 42. No Test Isolation

**Location:** `backend/tests/Feature/BookingTest.php`

- Tests create data without cleanup
- Tests depend on seeded data existing
- No `RefreshDatabase` trait
- No factories used

### 43. Empty handleResize Function

**Location:** `frontend/src/pages/property-details.jsx:73-75`

```jsx
const handleResize = () => {
  console.log("Window resized"); // Does nothing useful, just logs
};
```

### 44. Unused Store Updates

**Location:** `frontend/src/pages/property-details.jsx:89, 165, 187`

```jsx
store.addRecentlyViewed(id); // Updates store but component uses local state
store.addBooking(response.data.booking); // Store updated but never read
store.addReview(response.data.review); // Redundant with local state
```

### 45. Multiple useState for Form

**Location:** `frontend/src/pages/property-details.jsx:28-45`

```jsx
// 18 useState calls! Should use useReducer or form library
const [property, setProperty] = useState(null);
const [reviews, setReviews] = useState([]);
const [availability, setAvailability] = useState([]);
const [loading, setLoading] = useState(true);
const [reviewsLoading, setReviewsLoading] = useState(false);
const [availabilityLoading, setAvailabilityLoading] = useState(false);
const [error, setError] = useState(null);
const [checkIn, setCheckIn] = useState("");
const [checkOut, setCheckOut] = useState("");
const [guests, setGuests] = useState("2");
const [totalPrice, setTotalPrice] = useState(0);
const [isSubmitting, setIsSubmitting] = useState(false);
const [showModal, setShowModal] = useState(false);
const [selectedImage, setSelectedImage] = useState(0);
const [showAllReviews, setShowAllReviews] = useState(false);
const [newReview, setNewReview] = useState({ rating: "5", comment: "" });
const [isReviewSubmitting, setIsReviewSubmitting] = useState(false);
const [imageLoaded, setImageLoaded] = useState(false);
```

### 46. Index as Key in Lists

**Location:** `frontend/src/pages/property-details.jsx:437, 450, 470`

```jsx
{[1, 2, 3].map((i) => (
  <Skeleton key={i} className="h-24 rounded-xl" />  // Index as key
))}

{reviews.slice(0, 5).map((review, i) => (
  <div key={i} ...>  // Index as key for dynamic list - causes re-render issues
))}
```

### 47. Hardcoded UI Strings

**Location:** `frontend/src/pages/property-details.jsx:352-354`

```jsx
// Hardcoded values that should come from API or config
{ icon: Clock, label: 'Check-in', value: '3:00 PM' },
{ icon: Clock, label: 'Check-out', value: '11:00 AM' },
{ icon: Shield, label: 'Cancellation', value: 'Free 48h' },
```

### 48. Inconsistent Error Handling

**Location:** Various files

```jsx
// property-details.jsx - uses alert()
alert('Booking failed: ' + error);

// booking-list.jsx - also uses alert()
alert('Failed to cancel booking');

// manager-dashboard.jsx - silently fails
catch (err) {
  console.log('Error:', err);
}

// Should use consistent toast/notification system
```

### 49. No Loading State Handling for Dependent Data

**Location:** `frontend/src/pages/property-details.jsx:257`

```jsx
// Attempts to access property.amenities before checking if property is loaded
const amenities =
  typeof property.amenities === "string"
    ? JSON.parse(property.amenities)
    : property.amenities || [];
// Could crash if property is null
```

### 50. Business Logic in Component

**Location:** `frontend/src/pages/property-details.jsx:123-142`

```jsx
const calculatePrice = async () => {
  // Fallback calculation duplicates backend logic!
  if (property && checkIn && checkOut) {
    const nights = differenceInDays(new Date(checkOut), new Date(checkIn));
    let price = property.price_per_night * nights;
    if (company?.tier === "gold") price *= 0.8; // Duplicated discount logic
    setTotalPrice(price);
  }
};
```

---

## Summary Statistics

| Category                   | Count  |
| -------------------------- | ------ |
| Backend Anti-Patterns      | 13     |
| Frontend Anti-Patterns     | 18     |
| Database Anti-Patterns     | 5      |
| Architecture Anti-Patterns | 4      |
| Testing Anti-Patterns      | 10     |
| **Total**                  | **50** |

---

## Workshop Exercise Suggestions

1. **Extract Service Layer** - Move business logic from BookingController to dedicated services
2. **Fix N+1 Queries** - Use Eloquent eager loading (`with()`)
3. **Add Database Indexes** - Create migration to add missing indexes
4. **Implement Repository Pattern** - Abstract data access
5. **Fix Waterfall Fetches** - Use Promise.all or React Query
6. **Add Error Boundaries** - Implement React error handling
7. **Split Zustand Store** - Create slices with selectors
8. **Eliminate Prop Drilling** - Use React Context or Zustand
9. **Standardize API Responses** - Create response wrapper classes
10. **Add Proper Validation** - Use Laravel Form Requests
