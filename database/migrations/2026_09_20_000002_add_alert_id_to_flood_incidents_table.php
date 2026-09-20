<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('flood_incidents', function (Blueprint $table) {
            // Nullable so seeded historical incidents (which predate the
            // alert pipeline) remain valid, and unique so resolving an alert
            // twice cannot produce a duplicate incident.
            $table->foreignId('alert_id')
                ->nullable()
                ->unique()
                ->after('flood_zone_id')
                ->constrained()
                ->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('flood_incidents', function (Blueprint $table) {
            $table->dropConstrainedForeignId('alert_id');
        });
    }
};
