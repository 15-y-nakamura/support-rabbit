<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateWeekdayEventsTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('weekday_events', function (Blueprint $table) {
            $table->id();
            $table->foreignId('event_id')->constrained('calendar_events')->onDelete('cascade');
            $table->string('title');
            $table->text('description')->nullable();
            $table->dateTime('start_time');
            $table->dateTime('end_time')->nullable();
            $table->boolean('all_day')->default(false);
            $table->string('location')->nullable();
            $table->string('link')->nullable();
            $table->string('notification')->nullable();
            $table->enum('recurrence_type', ['none', 'weekday', 'weekend', 'weekly', 'monthly', 'yearly'])->default('none'); // 繰り返しの種類
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('weekday_events');
    }
}
