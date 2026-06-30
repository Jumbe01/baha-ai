<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('predictions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('sensor_id')->constrained()->cascadeOnDelete();
            $table->foreignId('flood_zone_id')->constrained()->cascadeOnDelete();
            $table->decimal('current_level', 8, 2);
            $table->decimal('rate_of_rise', 8, 4)->default(0);
            $table->decimal('predicted_level', 8, 2)->nullable();
            $table->integer('minutes_to_critical')->nullable();
            $table->decimal('confidence', 5, 2)->default(0);
            $table->string('risk_level')->default('safe');
            $table->text('recommendation')->nullable();
            $table->json('forecast_points')->nullable();
            $table->timestamp('generated_at');
            $table->timestamps();

            $table->index(['sensor_id', 'generated_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('predictions');
    }
};
