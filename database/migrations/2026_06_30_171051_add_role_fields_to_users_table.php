<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->string('role')->default('resident')->after('name');
            $table->string('mobile')->nullable()->after('email');
            $table->decimal('latitude', 10, 7)->nullable()->after('mobile');
            $table->decimal('longitude', 10, 7)->nullable()->after('latitude');
            $table->string('address')->nullable()->after('longitude');
            $table->string('barangay')->nullable()->after('address');
            $table->json('notification_preference')->nullable()->after('barangay');
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn([
                'role',
                'mobile',
                'latitude',
                'longitude',
                'address',
                'barangay',
                'notification_preference',
            ]);
        });
    }
};
