#!/bin/sh
set -e

cd /var/www/html

# ------------------------------------------------------------
# Helper: set (or append) a KEY=value line in the .env file.
# ------------------------------------------------------------
set_env() {
    key="$1"
    val="$2"
    esc=$(printf '%s' "$val" | sed -e 's/[&|\\]/\\&/g')
    if grep -q "^${key}=" .env; then
        sed -i "s|^${key}=.*|${key}=${esc}|" .env
    else
        echo "${key}=${val}" >> .env
    fi
}

# ------------------------------------------------------------
# 1. Ensure a .env file exists (the image ships without one so
#    each container gets its own APP_KEY).
# ------------------------------------------------------------
if [ ! -f .env ]; then
    cp .env.example .env
fi

# ------------------------------------------------------------
# 2. Write the runtime configuration (from container env vars)
#    into .env so the settings are unambiguous regardless of the
#    .env.example defaults.
# ------------------------------------------------------------
set_env APP_NAME    "${APP_NAME:-BahaAI}"
set_env APP_ENV     "${APP_ENV:-local}"
set_env APP_DEBUG   "${APP_DEBUG:-true}"
set_env APP_URL     "${APP_URL:-http://localhost:8000}"

set_env DB_CONNECTION "${DB_CONNECTION:-pgsql}"
set_env DB_HOST       "${DB_HOST:-db}"
set_env DB_PORT       "${DB_PORT:-5432}"
set_env DB_DATABASE   "${DB_DATABASE:-baha_ai}"
set_env DB_USERNAME   "${DB_USERNAME:-baha}"
set_env DB_PASSWORD   "${DB_PASSWORD:-secret}"

set_env OPENWEATHERMAP_API_KEY "${OPENWEATHERMAP_API_KEY:-}"

# ------------------------------------------------------------
# 3. Generate an application key if one is not set yet. (This is
#    also the first artisan call, which rebuilds the package
#    manifest that was skipped at build time.)
# ------------------------------------------------------------
if ! grep -q "^APP_KEY=base64:" .env; then
    php artisan key:generate --force
fi

# ------------------------------------------------------------
# 4. Wait for PostgreSQL to accept connections.
# ------------------------------------------------------------
echo "Waiting for database at ${DB_HOST:-db}:${DB_PORT:-5432} ..."
until php -r "exit(@fsockopen(getenv('DB_HOST') ?: 'db', (int)(getenv('DB_PORT') ?: 5432)) ? 0 : 1);"; do
    sleep 2
done
echo "Database is ready."

# ------------------------------------------------------------
# 5. Run migrations (safe to run every start — already-applied
#    migrations are skipped).
# ------------------------------------------------------------
php artisan migrate --force

# ------------------------------------------------------------
# 6. Seed demo data ONCE — only when the users table is empty.
#    A direct PDO count keeps the output to a single integer.
# ------------------------------------------------------------
USER_COUNT=$(php -r '
try {
    $pdo = new PDO(
        "pgsql:host=".(getenv("DB_HOST") ?: "db").";port=".(getenv("DB_PORT") ?: "5432").";dbname=".getenv("DB_DATABASE"),
        getenv("DB_USERNAME"),
        getenv("DB_PASSWORD")
    );
    echo (int) $pdo->query("SELECT COUNT(*) FROM users")->fetchColumn();
} catch (Throwable $e) {
    echo 0;
}
')

if [ "$USER_COUNT" = "0" ]; then
    echo "Seeding demo data (flood zones, sensors, readings, incidents, users) ..."
    php artisan db:seed --force
else
    echo "Database already seeded ($USER_COUNT users) — skipping seed."
fi

# ------------------------------------------------------------
# 7. Clear caches so runtime environment values are respected.
# ------------------------------------------------------------
php artisan config:clear
php artisan route:clear >/dev/null 2>&1 || true
php artisan view:clear >/dev/null 2>&1 || true

# ------------------------------------------------------------
# 8. Serve the application.
# ------------------------------------------------------------
echo ""
echo "========================================================"
echo "  BahaAI is running  ->  http://localhost:8000"
echo "  Admin login: admin@bahaai.test   password: password"
echo "========================================================"
echo ""

exec php artisan serve --host=0.0.0.0 --port=8000
