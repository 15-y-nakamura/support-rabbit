<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class CalendarEvent extends Model
{
    use HasFactory;

    protected $table = 'calendar_events';

    protected $fillable = [
        'user_id',
        'event_id',
        'title',
        'description',
        'start_time',
        'end_time',
        'all_day',
        'location',
        'link',
        'notification',
        'is_recurring',
        'recurrence_type',
        'tag_id',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function tag()
    {
        return $this->belongsTo(Tag::class, 'tag_id');
    }

    public function weekday_events()
    {
        return $this->hasMany(RecurringEvent::class, 'event_id');
    }
}