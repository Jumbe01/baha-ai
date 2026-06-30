<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('weather_data', function (Blueprint $table) {
            $table->id();
            $table->string('location')->default('Consolacion');
            $table->decimal('latitude', 10, 7);
            $table->decimal('longitude', 10, 7);
            $table->decimal('temperature', 5, 2)->nullable();
            $table->decimal('feels_like', 5, 2)->nullable();
            $table->integer('humidity')->nullable();
            $table->decimal('rainfall', 6, 2)->default(0);
            $table->decimal('wind_speed', 5, 2)->nullable();
            $table->string('condition')->nullable();
            $table->string('description')->nullable();
            $table->string('icon')->nullable();
            $table->json('forecast')->nullable();
            $table->timestamp('fetched_at');
            $table->timestamps();

            $table->index('fetched_at');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('weather_data');
    }
};
