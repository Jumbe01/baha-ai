<?php

use App\Http\Controllers\ActuatorController;
use App\Http\Controllers\Admin\FloodZoneController;
use App\Http\Controllers\Admin\SensorController;
use App\Http\Controllers\Admin\UserController;
use App\Http\Controllers\AlertController;
use App\Http\Controllers\AnalyticsController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\FloodReportController;
use App\Http\Controllers\GpsAlertController;
use App\Http\Controllers\HistoricalController;
use App\Http\Controllers\LocationController;
use App\Http\Controllers\MapController;
use App\Http\Controllers\NotificationController;
use App\Http\Controllers\PredictionController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\WaterLevelController;
use App\Http\Controllers\WeatherController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('Welcome', [
        'canLogin' => Route::has('login'),
        'canRegister' => Route::has('register'),
        'laravelVersion' => Application::VERSION,
        'phpVersion' => PHP_VERSION,
    ]);
});

Route::get('/dashboard', DashboardController::class)
    ->middleware(['auth', 'verified'])->name('dashboard');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('/water-levels', [WaterLevelController::class, 'index'])->name('water-levels.index');
    Route::get('/water-levels/{sensor}', [WaterLevelController::class, 'show'])->name('water-levels.show');

    Route::get('/alerts', [AlertController::class, 'index'])->name('alerts.index');
    Route::get('/alerts/create', [AlertController::class, 'create'])->name('alerts.create')->middleware('staff');
    Route::post('/alerts', [AlertController::class, 'store'])->name('alerts.store')->middleware('staff');
    Route::get('/alerts/{alert}', [AlertController::class, 'show'])->name('alerts.show');
    Route::patch('/alerts/{alert}/resolve', [AlertController::class, 'resolve'])->name('alerts.resolve')->middleware('staff');

    Route::get('/notifications', [NotificationController::class, 'index'])->name('notifications.index');
    Route::patch('/notifications/{notification}/read', [NotificationController::class, 'markRead'])->name('notifications.read');
    Route::patch('/notifications/read-all', [NotificationController::class, 'markAllRead'])->name('notifications.read-all');

    Route::get('/predictions', [PredictionController::class, 'index'])->name('predictions.index');
    Route::post('/predictions/generate', [PredictionController::class, 'generate'])->name('predictions.generate')->middleware('staff');

    Route::get('/weather', [WeatherController::class, 'index'])->name('weather.index');
    Route::get('/map', [MapController::class, 'index'])->name('map.index');

    Route::get('/gps-alerts', [GpsAlertController::class, 'index'])->name('gps-alerts.index');

    Route::post('/flood-reports', [FloodReportController::class, 'store'])->name('flood-reports.store');

    // Informational / secondary pages (full parity with reference nav).
    Route::get('/evacuation-centers', fn () => Inertia::render('EvacuationCenters/Index'))->name('evacuation.index');
    Route::get('/historical-data', [HistoricalController::class, 'index'])->name('historical.index');
    Route::get('/help', fn () => Inertia::render('Help/Index'))->name('help.index');
    Route::get('/about', fn () => Inertia::render('About/Index'))->name('about.index');

    Route::middleware('staff')->group(function () {
        Route::get('/analytics', [AnalyticsController::class, 'index'])->name('analytics.index');
        Route::get('/analytics/export', [AnalyticsController::class, 'export'])->name('analytics.export');

        Route::get('/actuation', [ActuatorController::class, 'index'])->name('actuation.index');
        Route::patch('/actuation/{device}/toggle', [ActuatorController::class, 'toggle'])->name('actuation.toggle');
        Route::patch('/actuation/{device}/mode', [ActuatorController::class, 'switchMode'])->name('actuation.mode');
    });
});

Route::middleware('auth')->group(function () {
    Route::get('/location', [LocationController::class, 'edit'])->name('location.select');
    Route::patch('/location', [LocationController::class, 'update'])->name('location.update');

    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

Route::middleware(['auth', 'verified', 'admin'])->prefix('admin')->name('admin.')->group(function () {
    Route::resource('flood-zones', FloodZoneController::class)->except('show');
    Route::resource('sensors', SensorController::class)->except('show');
    Route::resource('users', UserController::class)->only(['index', 'create', 'store', 'destroy']);
});

require __DIR__.'/auth.php';
