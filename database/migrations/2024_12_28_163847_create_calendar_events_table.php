<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateCalendarEventsTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('calendar_events', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->string('title');
            $table->text('description')->nullable();
            $table->dateTime('start_time');
            $table->dateTime('end_time')->nullable();
            $table->boolean('all_day')->default(false);
            $table->string('location')->nullable();
            $table->string('link')->nullable();
            $table->string('notification')->nullable();
            $table->boolean('is_recurring')->default(false); // 繰り返し設定のフラグ
            $table->enum('recurrence_type', ['none', 'weekday', 'weekend', 'weekly', 'monthly', 'yearly'])->default('none'); // 繰り返しの種類
            $table->json('recurrence_dates')->nullable(); // 繰り返しの日付
            $table->json('recurrence_days')->nullable(); // 繰り返しの曜日
            $table->time('recurrence_start_time')->nullable(); // 繰り返しの開始時刻
            $table->time('recurrence_end_time')->nullable(); // 繰り返しの終了時刻
            $table->foreignId('tag_id')->nullable()->constrained('calendar_tags')->onDelete('set null'); // タグの外部キー
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
        Schema::dropIfExists('calendar_events');
    }
}
