<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('evacuation_centers', function (Blueprint $table) {
            $table->id();
            // A centre belongs to the zone it serves; nullable so a municipal
            // centre serving several barangays can exist without one.
            $table->foreignId('flood_zone_id')->nullable()->constrained()->nullOnDelete();
            $table->string('name');
            $table->string('barangay');
            $table->string('address')->nullable();
            $table->integer('capacity')->default(0);
            $table->integer('current_occupancy')->default(0);
            $table->decimal('latitude', 10, 7);
            $table->decimal('longitude', 10, 7);
            $table->string('contact_number')->nullable();
            // open | full | closed — the real-time availability the manuscript calls for
            $table->string('status')->default('open');
            $table->boolean('is_active')->default(true);
            $table->timestamps();

            $table->index(['flood_zone_id', 'status']);
            $table->index('barangay');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('evacuation_centers');
    }
};
