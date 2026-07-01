# BahaAI — IoT-Based Flood Alert System

A web-based flood early-warning platform for the **Municipality of Consolacion, Cebu**. BahaAI continuously monitors water levels across flood-prone barangays, forecasts when a location may reach a dangerous level using linear-regression predictions, and automatically alerts the right people in time to act.

> **Capstone / thesis edition.** This repository is the **web platform**. The physical IoT hardware (ultrasonic sensors, rain gauges, pumps, sirens) is **simulated in software** so the system can be demonstrated end-to-end. Simulated readings and real device data both flow through the same ingestion API, so connecting real hardware later requires no changes to the platform.

---

## Features

- **Role-based access** — Administrator, DRRMO/Staff, and Community Resident, each with a tailored dashboard and permissions.
- **OTP authentication** — email one-time-password verification on registration.
- **Sensor & flood-zone management** — CRUD for zones (with per-zone safe/warning/critical thresholds) and sensors.
- **Real-time monitoring** — live dashboard, per-sensor water-level gauges, and time-series charts.
- **AI flood predictions** — linear regression over recent readings estimates rate of rise, time-to-critical, and an R²-based confidence score.
- **Automated alerts & notifications** — threshold breaches create alerts and dispatch (simulated) SMS/email/push to affected-barangay residents and all staff, with a full delivery log.
- **Weather** — OpenWeatherMap integration with caching and a realistic simulated fallback when no API key is set.
- **GIS flood map** — MapLibre map with risk-colored flood-zone polygons and interactive sensor markers, plus a GPS evacuation-route view.
- **Smart actuation** — control panel for pumps/sirens/floodgates with auto/manual modes and activity logging (simulated).
- **Historical analytics** — date-range analytics with CSV and PDF export.
- **Admin user management** — create, filter, and remove accounts.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Backend | Laravel 13, PHP 8.4+ |
| Frontend | Inertia.js v2, React 18, TypeScript |
| Styling | Tailwind CSS v3 |
| Auth | Laravel Breeze (React/TS) + custom OTP |
| Database | PostgreSQL |
| Charts | Recharts |
| Maps | MapLibre GL + OpenStreetMap tiles |
| Weather | OpenWeatherMap API (free tier) |
| PDF export | barryvdh/laravel-dompdf |
| Testing | PHPUnit (160 tests) |

## Requirements

- PHP **8.4+**
- Composer
- Node.js 18+ and npm
- PostgreSQL

## Installation

```bash
# 1. Clone
git clone https://github.com/Jumbe01/baha-ai.git
cd baha-ai

# 2. Install dependencies
composer install
npm install --legacy-peer-deps        # --legacy-peer-deps required (Vite 8 peer conflict)

# 3. Environment
cp .env.example .env
php artisan key:generate
```

Configure the database in `.env`:

```dotenv
DB_CONNECTION=pgsql
DB_HOST=127.0.0.1
DB_PORT=5432
DB_DATABASE=baha_ai
DB_USERNAME=postgres
DB_PASSWORD=your_password
```

Create the database, then run migrations and seeders:

```bash
php artisan migrate --seed
```

Seeding creates: 1 admin, 3 staff, 20 residents, 7 flood zones, ~14 sensors with 30 days of readings, historical flood incidents, and actuator devices.

**Default admin login:** `admin@bahaai.test`

### (Optional) Live weather

Add an [OpenWeatherMap](https://openweathermap.org/api) key to `.env`. Without it, the app uses realistic simulated weather.

```dotenv
OPENWEATHERMAP_API_KEY=your_key_here
```

## Running

```bash
# Backend + Vite together
composer run dev

# — or separately —
php artisan serve
npm run dev
```

> **Build note:** for a production build, use `npx vite build`. `recharts` requires `react-is` (installed by default here); if you reinstall node modules, keep it.

## Demo & Simulation

Because IoT hardware is simulated, use these commands to generate live activity:

```bash
# Inject a fresh reading into every active sensor
php artisan sensors:simulate

# Generate elevated readings to trigger warning/critical alerts (watch the pipeline fire)
php artisan sensors:simulate --storm

# Generate flood predictions for all active sensors
php artisan predictions:generate

# Fetch/refresh weather (bypasses the 30-min cache)
php artisan weather:fetch
```

Scheduled tasks (via `php artisan schedule:work`): `weather:fetch` hourly, `predictions:generate` every 15 minutes.

## How It Works

### Data flow
Sensor readings enter through three paths — 30-day seeded history, the `sensors:simulate` command, and `POST /api/sensors/{sensor}/readings` (the path a real device uses). All three land as `sensor_readings` and drive the rest of the system identically.

### Predictions
For each sensor, a linear regression is fit over the last **120 minutes** of readings (≥3 points required):

```
rate_of_rise         = slope of the fitted line (m/min)
minutes_to_critical  = (critical_threshold − current_level) / rate_of_rise
confidence (%)       = R² × 100
```

A prediction is **critical** if the level is already critical or projected to reach critical within 60 minutes, **warning** if at/above the warning threshold, otherwise **safe**.

### Alerts
When a reading crosses a zone's warning/critical threshold, an alert is created (deduplicated per sensor+severity) and notifications are dispatched to residents in the affected barangay plus all staff/admins. SMS/email/push delivery is simulated via a notification log.

## Testing

```bash
php artisan test --compact
```

The suite covers auth/OTP, role middleware, sensor/zone CRUD, the ingestion API, the risk service, the dashboard, the alert pipeline, notifications, predictions, weather, the GeoJSON map endpoints, analytics/export, actuation, and user management.

## Documentation

A full end-user manual (all three roles, plus how predictions/alerts/data work) is in [`docs/user-guide.html`](docs/user-guide.html) — open it in a browser or print to PDF.

## Project Structure

```
app/
  Console/Commands/     # sensors:simulate, predictions:generate, weather:fetch
  Http/Controllers/     # dashboard, water-levels, alerts, predictions, weather, map,
                        #   analytics, actuation, admin (zones/sensors/users), api
  Models/               # FloodZone, Sensor, SensorReading, Alert, Prediction, etc.
  Services/             # RiskLevelService, AlertService, PredictionService,
                        #   WeatherService, NotificationDispatcher, ReportExportService
database/
  migrations/  factories/  seeders/
resources/js/
  Pages/                # Inertia React pages by feature
  Components/           # UI kit, charts, MapLibre map components
docs/user-guide.html    # end-user manual
```

## User Roles

| Role | Capabilities |
|------|-------------|
| **Administrator** | Everything, plus manage flood zones, sensors, and user accounts. |
| **DRRMO / Staff** | Monitor, issue/resolve alerts, generate predictions, control actuators, view analytics & export. |
| **Resident** | View dashboards, water levels, predictions, weather, and the map; receive alert notifications. |

## License

Academic capstone project. Not licensed for production/commercial use.
