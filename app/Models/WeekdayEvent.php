<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class WeekdayEvent extends Model
{
    use HasFactory;

    protected $table = 'weekday_events';

    protected $fillable = [
        'event_id',
        'title',
        'description',
        'start_time',
        'end_time',
        'all_day',
        'location',
        'link',
        'notification',
        'recurrence_type', // 繰り返しの種類
        'tag_id',
    ];

    
    // Tagリレーションの追加
    public function tag()
    {
        return $this->belongsTo(Tag::class, 'tag_id');
    }
}
