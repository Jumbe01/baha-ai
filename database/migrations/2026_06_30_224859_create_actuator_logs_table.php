<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('actuator_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('actuator_device_id')->constrained()->cascadeOnDelete();
            $table->foreignId('user_id')->nullable()->constrained()->nullOnDelete();
            $table->string('action');
            $table->string('trigger')->default('manual');
            $table->text('notes')->nullable();
            $table->timestamp('logged_at');
            $table->timestamps();

            $table->index(['actuator_device_id', 'logged_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('actuator_logs');
    }
};
