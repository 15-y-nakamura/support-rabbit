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
    ];

    // Tagリレーションの追加
    public function tag()
    {
        return $this->belongsTo(Tag::class, 'tag_id');
    }
}