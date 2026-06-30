<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('alerts', function (Blueprint $table) {
            $table->id();
            $table->foreignId('flood_zone_id')->constrained()->cascadeOnDelete();
            $table->foreignId('sensor_id')->nullable()->constrained()->nullOnDelete();
            $table->string('severity')->default('warning');
            $table->string('title');
            $table->text('message');
            $table->decimal('water_level', 8, 2)->nullable();
            $table->string('status')->default('active');
            $table->string('source')->default('automatic');
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('resolved_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('resolved_at')->nullable();
            $table->timestamps();

            $table->index(['status', 'severity']);
            $table->index(['flood_zone_id', 'status']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('alerts');
    }
};
