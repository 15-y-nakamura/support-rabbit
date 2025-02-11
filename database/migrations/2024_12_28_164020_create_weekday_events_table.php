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
            $table->foreignId('user_id')->constrained()->onDelete('cascade'); 
            $table->string('title');
            $table->dateTime('start_time');
            $table->dateTime('end_time')->nullable();
            $table->boolean('all_day')->default(false);
            $table->string('location')->nullable();
            $table->string('link')->nullable();
            $table->foreignId('tag_id')->nullable()->constrained('calendar_tags')->onDelete('set null'); 
            $table->text('note')->nullable();
            $table->enum('recurrence_type', ['none', 'weekday', 'weekend', 'weekly', 'monthly', 'yearly'])->default('weekday'); 
            $table->timestamps();
        });
    }

    public function down()
    {
        Schema::dropIfExists('weekday_events');
    }
}