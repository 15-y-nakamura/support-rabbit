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
        'title',
        'start_time',
        'end_time',
        'all_day',
        'notification',
        'location',
        'link',
        'tag_id',
        'description',
        'is_recurring',
        'recurrence_type',
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
        return $this->hasMany(WeekdayEvent::class, 'event_id');
    }

    public function weekend_events()
    {
        return $this->hasMany(WeekendEvent::class, 'event_id');
    }

    public function weekly_events()
    {
        return $this->hasMany(WeeklyEvent::class, 'event_id');
    }

    public function monthly_events()
    {
        return $this->hasMany(MonthlyEvent::class, 'event_id');
    }

    public function yearly_events()
    {
        return $this->hasMany(YearlyEvent::class, 'event_id');
    }
}