<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Achievement extends Model
{
    use HasFactory;

    protected $fillable = [
        'event_id',
        'user_id',
        'title',
        'start_time',
        'end_time',
        'achieved_at',
    ];

    public $timestamps = false; // タイムスタンプの自動設定を無効にする

    public function event()
    {
        return $this->belongsTo(CalendarEvent::class);
    }
}