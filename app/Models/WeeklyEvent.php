<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class WeeklyEvent extends Model
{
    use HasFactory;

    protected $table = 'weekly_events';

    protected $fillable = [
        'event_id',
        'user_id',
        'title',
        'start_time',
        'end_time',
        'all_day',
        'location',
        'link',
        'tag_id',
        'note',
        'recurrence_type',
        'recurrence_days', 
    ];

    public function tag()
    {
        return $this->belongsTo(Tag::class, 'tag_id');
    }

    public function getRecurrenceDaysAttribute($value)
    {
        return json_decode($value, true);
    }
}