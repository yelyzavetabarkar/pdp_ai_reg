# StayCorporate

A modern booking platform built with React 19 and Laravel 8.

## Requirements

- Docker
- Node.js 16+
- PHP 8.1

## Installation

1. Clone the repository
2. Run `npm install`
3. Copy `.env.example` to `.env`
4. Run `php artisan migrate`

## Running the app

Start the development server:

```
npm run dev
```

## API Endpoints

- GET /api/bookings - Get all bookings
- POST /api/bookings - Create a booking
- GET /api/properties - List properties

## Environment Variables

Copy `.env.example` to `.env` and fill in the values.

## Testing

```
php artisan test
```

---

Last updated: March 2021
