<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('flood_incidents', function (Blueprint $table) {
            $table->id();
            $table->foreignId('flood_zone_id')->constrained()->cascadeOnDelete();
            $table->string('severity')->default('warning');
            $table->decimal('peak_water_level', 8, 2);
            $table->decimal('total_rainfall', 8, 2)->default(0);
            $table->integer('duration_minutes')->nullable();
            $table->integer('affected_residents')->default(0);
            $table->text('description')->nullable();
            $table->timestamp('occurred_at');
            $table->timestamps();

            $table->index(['flood_zone_id', 'occurred_at']);
            $table->index('occurred_at');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('flood_incidents');
    }
};
