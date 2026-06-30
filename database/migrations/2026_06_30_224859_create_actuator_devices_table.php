<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('actuator_devices', function (Blueprint $table) {
            $table->id();
            $table->foreignId('flood_zone_id')->nullable()->constrained()->nullOnDelete();
            $table->string('name');
            $table->string('type')->default('pump');
            $table->decimal('latitude', 10, 7)->nullable();
            $table->decimal('longitude', 10, 7)->nullable();
            $table->boolean('is_on')->default(false);
            $table->string('mode')->default('auto');
            $table->string('status')->default('operational');
            $table->timestamp('last_activated_at')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('actuator_devices');
    }
};
