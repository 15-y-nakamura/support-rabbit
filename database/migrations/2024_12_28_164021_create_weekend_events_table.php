<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateWeekendEventsTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('weekend_events', function (Blueprint $table) {
            $table->id();
            $table->foreignId('event_id')->constrained('calendar_events')->onDelete('cascade');
            $table->foreignId('user_id')->constrained()->onDelete('cascade'); 
            $table->string('title');
            $table->dateTime('start_time');
            $table->dateTime('end_time')->nullable();
            $table->boolean('all_day')->default(false);
            $table->string('notification')->nullable();
            $table->string('location')->nullable();
            $table->string('link')->nullable();
            $table->foreignId('tag_id')->nullable()->constrained('calendar_tags')->onDelete('set null'); // タグの外部キー
            $table->text('description')->nullable();
            $table->enum('recurrence_type', ['none', 'weekday', 'weekend', 'weekly', 'monthly', 'yearly'])->default('weekend'); // 繰り返しの種類
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
        Schema::dropIfExists('weekend_events');
    }
}
