<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Achievement extends Model
{
    use HasFactory;

    protected $fillable = [
        'event_id',
        'title',
        'start_time',
        'end_time',
        'achieved_at',
    ];

    public function event()
    {
        return $this->belongsTo(CalendarEvent::class);
    }
}