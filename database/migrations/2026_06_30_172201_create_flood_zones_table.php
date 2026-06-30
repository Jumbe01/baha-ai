<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('flood_zones', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->text('description')->nullable();
            $table->string('barangay');
            $table->decimal('safe_threshold', 8, 2)->default(0);
            $table->decimal('warning_threshold', 8, 2)->default(1.5);
            $table->decimal('critical_threshold', 8, 2)->default(3.0);
            $table->json('coordinates');
            $table->string('risk_level')->default('safe');
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('flood_zones');
    }
};
