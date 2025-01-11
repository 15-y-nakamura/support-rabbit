<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class RecurringEvent extends Model
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
    ];
}
