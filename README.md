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

## Run It on Your Own Computer (recommended — for students)

BahaAI runs **100% locally on your laptop** using Docker. The whole system — the app, the PostgreSQL database, and the compiled website — runs inside containers on *your* machine. Nothing runs on a server. After the first setup, it even works without internet.

**The only thing you need to install is [Docker Desktop](https://www.docker.com/products/docker-desktop/)** (free). No PHP, Node, Composer, or PostgreSQL required.

### Step 1 — Install Docker Desktop

- **Windows:** download and install Docker Desktop, then **restart your computer**. (If prompted, allow it to enable WSL 2.)
- **macOS:** download the version for your chip (Apple Silicon or Intel), then drag it to Applications.
- Open Docker Desktop once and wait until it says **"Engine running"** in the bottom-left corner.

### Step 2 — Get the project

Either **download the ZIP** (easiest, no git needed):

1. Go to <https://github.com/Jumbe01/baha-ai>
2. Click the green **Code** button → **Download ZIP**
3. Extract it somewhere (e.g. your Desktop)

…or, if you have git: `git clone https://github.com/Jumbe01/baha-ai.git`

### Step 3 — Start it

Open a terminal **inside the project folder** (the one containing `docker-compose.yml`):

- **Windows:** open the folder in File Explorer, type `cmd` in the address bar, and press Enter.
- **macOS:** right-click the folder → *New Terminal at Folder*.

Then run:

```bash
docker compose up --build
```

The first run takes a few minutes (it downloads and builds everything). Wait until you see:

```
BahaAI is running  ->  http://localhost:8000
```

### Step 4 — Open the app

Open your browser to **http://localhost:8000**

- **Login:** `admin@bahaai.test` &nbsp;·&nbsp; **Password:** `password`

### Everyday commands

| I want to… | Command |
|-----------|---------|
| Start the app | `docker compose up` |
| Stop the app | Press `Ctrl+C`, or run `docker compose down` |
| Rebuild after code changes | `docker compose up --build` |
| Reset everything (wipe the database) | `docker compose down -v` then `docker compose up --build` |

Your data (accounts, readings, alerts) is saved between runs, so you can stop and start anytime without losing progress.

### Configuration / environment variables (optional)

It works out of the box, but if you want to change something (add a weather key, change the port, etc.), copy the example config to `.env` and edit it:

```bash
cp .env.docker.example .env      # macOS/Linux
copy .env.docker.example .env    # Windows
```

Docker Compose reads that `.env` automatically. The settings you can change:

| Variable | Default | What it does |
|----------|---------|--------------|
| `APP_PORT` | `8000` | Port on your computer (change if 8000 is taken, e.g. `8080`) |
| `APP_URL` | `http://localhost:8000` | The app's base URL (match it to `APP_PORT`) |
| `OPENWEATHERMAP_API_KEY` | *(blank)* | Add a [free key](https://openweathermap.org/api) for **live** weather; blank = simulated |
| `DB_DATABASE` / `DB_USERNAME` / `DB_PASSWORD` | `baha_ai` / `baha` / `secret` | Database credentials (app + DB stay in sync automatically) |

> **Note:** the database host/port/driver are fixed to the Docker network on purpose, so they aren't listed here. This Docker `.env` is separate from Laravel's own `.env` — the container generates its own internal one at startup.

<details>
<summary>One-off override without a file</summary>

You can also set a variable for a single run:

```bash
# macOS / Linux
OPENWEATHERMAP_API_KEY=your_key_here docker compose up --build

# Windows PowerShell
$env:OPENWEATHERMAP_API_KEY="your_key_here"; docker compose up --build
```
</details>

<details>
<summary>Troubleshooting</summary>

- **"port is already allocated" / port 8000 in use** — something else is using port 8000. Edit `docker-compose.yml`, change `"8000:8000"` to `"8080:8000"`, and open <http://localhost:8080> instead.
- **"Cannot connect to the Docker daemon"** — Docker Desktop isn't running. Open it and wait for "Engine running", then try again.
- **The build seems stuck on the first run** — that's normal; the first build downloads several hundred MB. Give it a few minutes.
- **Made changes but don't see them** — rebuild with `docker compose up --build`.
</details>

---

## Manual Installation (without Docker)

For local development you can run it directly. This path requires PHP, Node, and PostgreSQL installed on your machine.

### Requirements

- PHP **8.4+**
- Composer
- Node.js 18+ and npm
- PostgreSQL

### Steps

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

- **[`docs/student-guide.html`](docs/student-guide.html)** — hands-on testing guide for students: how to start it with Docker, a command cheat sheet, a guided "make a flood happen" walkthrough, and a field-by-field reference for every screen. Start here.
- **[`docs/user-guide.html`](docs/user-guide.html)** — deeper end-user manual explaining all three roles and how predictions/alerts/data work internally.

Open either in a browser or print to PDF.

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
