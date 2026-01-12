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

## Running with Docker

The project includes a complete Docker setup for local development with PostgreSQL, Laravel backend, and React frontend.

### Prerequisites

- Docker Engine 20.10+
- Docker Compose v2+

### Services Overview

| Service    | Container Name | Port  | Description                     |
|------------|----------------|-------|---------------------------------|
| PostgreSQL | app_postgres   | 5432  | PostgreSQL 16 database          |
| Backend    | app_backend    | 8000  | Laravel API server              |
| Frontend   | app_frontend   | 5173  | React dev server (Vite)         |

### Quick Start

1. **Clone the repository and navigate to the project directory:**

   ```bash
   git clone <repository-url>
   cd pdp_ai_reg
   ```

2. **Create environment file (optional):**

   You can customize database credentials by creating a `.env` file in the project root:

   ```bash
   DB_DATABASE=laravel
   DB_USERNAME=laravel
   DB_PASSWORD=secret
   ```

   Default values will be used if not specified.

3. **Start all services:**

   ```bash
   docker compose up
   ```

   Or run in detached mode:

   ```bash
   docker compose up -d
   ```

4. **Access the application:**

   - Frontend: http://localhost:5173
   - Backend API: http://localhost:8000
   - Database: localhost:5432

### Common Docker Commands

```bash
# Start all services
docker compose up

# Start in detached mode (background)
docker compose up -d

# Stop all services
docker compose down

# Stop and remove volumes (clears database data)
docker compose down -v

# Rebuild containers (after Dockerfile changes)
docker compose up --build

# View logs
docker compose logs

# View logs for specific service
docker compose logs backend
docker compose logs frontend

# Execute command in backend container
docker compose exec backend php artisan migrate
docker compose exec backend php artisan db:seed

# Execute command in frontend container
docker compose exec frontend pnpm install <package>
```

### Development Workflow

The Docker setup uses volume mounts for hot-reloading:

- **Backend**: Changes to `./backend` are reflected immediately. The Laravel development server automatically reloads.
- **Frontend**: Changes to `./frontend` trigger Vite's hot module replacement (HMR).

### Database Access

Connect to PostgreSQL using any database client:

```
Host: localhost
Port: 5432
Database: laravel (or your DB_DATABASE value)
Username: laravel (or your DB_USERNAME value)
Password: secret (or your DB_PASSWORD value)
```

### Troubleshooting

**Containers fail to start:**
```bash
# Check container status
docker compose ps

# View detailed logs
docker compose logs --tail=100
```

**Database connection issues:**
```bash
# Ensure postgres is healthy before backend starts
docker compose up postgres -d
docker compose logs postgres

# Once healthy, start other services
docker compose up
```

**Port conflicts:**

If ports 5432, 8000, or 5173 are already in use, stop the conflicting services or modify the port mappings in `docker-compose.yml`.

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
