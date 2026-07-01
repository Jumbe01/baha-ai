# syntax=docker/dockerfile:1

# ============================================================
# Stage 1 — Build the frontend assets with Vite
# ============================================================
FROM node:20-bookworm AS frontend

WORKDIR /app

# Install node dependencies (legacy-peer-deps required due to Vite 8 peer range)
COPY package.json package-lock.json ./
RUN npm install --legacy-peer-deps

# Copy the sources Vite needs and build the production bundle.
# We call `vite build` directly (not `npm run build`) to skip the `tsc`
# type-check step, which would require dev-only type packages.
COPY vite.config.js tsconfig.json tailwind.config.js postcss.config.js ./
COPY resources ./resources
COPY public ./public
RUN npx vite build


# ============================================================
# Stage 2 — PHP application (Laravel 13 needs PHP 8.4+)
# ============================================================
FROM php:8.4-cli-bookworm AS app

ENV COMPOSER_ALLOW_SUPERUSER=1 \
    DEBIAN_FRONTEND=noninteractive

# System libraries + PHP extensions required by the app
# (pdo_pgsql/pgsql for PostgreSQL, gd/zip for DomPDF, mbstring/bcmath for Laravel)
RUN apt-get update && apt-get install -y --no-install-recommends \
        git unzip libpq-dev libzip-dev libonig-dev \
        libpng-dev libjpeg-dev libfreetype6-dev \
    && docker-php-ext-configure gd --with-freetype --with-jpeg \
    && docker-php-ext-install -j"$(nproc)" pdo_pgsql pgsql mbstring bcmath zip gd \
    && apt-get clean && rm -rf /var/lib/apt/lists/*

# Composer (pulled from the official Composer image)
COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

WORKDIR /var/www/html

# Copy the application source
COPY . .

# Install PHP dependencies. Dev dependencies are kept because the database
# seeders rely on Faker. `--no-scripts` skips package discovery at build time
# (it needs no .env / APP_KEY); Laravel rebuilds that manifest automatically
# on the first artisan call inside the entrypoint.
RUN composer install --no-scripts --optimize-autoloader --no-interaction

# Drop in the compiled frontend assets from the Node stage
COPY --from=frontend /app/public/build ./public/build

# Make Laravel's writable directories writable
RUN chmod -R 775 storage bootstrap/cache

# Entrypoint prepares the environment, waits for the DB, migrates & seeds,
# then serves the app. `sed` strips any CRLF line endings so the script runs
# even when the repo was checked out on Windows.
COPY docker/entrypoint.sh /usr/local/bin/entrypoint.sh
RUN sed -i 's/\r$//' /usr/local/bin/entrypoint.sh \
    && chmod +x /usr/local/bin/entrypoint.sh

EXPOSE 8000

ENTRYPOINT ["entrypoint.sh"]
