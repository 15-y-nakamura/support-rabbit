<?php

namespace App\Http\Requests\Calendar;

use Illuminate\Foundation\Http\FormRequest;

class CalendarEventRequest extends FormRequest
{
    public function authorize()
    {
        return true;
    }

    public function rules()
    {
        return [
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'start_time' => 'required|date_format:Y-m-d\TH:i',
            'end_time' => 'nullable|date_format:Y-m-d\TH:i|after_or_equal:start_time',
            'all_day' => 'boolean',
            'location' => 'nullable|string|max:255',
            'link' => 'nullable|url|max:255',
            'notification' => 'nullable|string|max:255',
            'is_recurring' => 'boolean',
            'recurrence_type' => 'required|in:none,weekday,weekend,weekly,monthly,yearly',
            'tags' => 'nullable|array',
            'tags.*' => 'exists:tags,id',
        ];
    }
}
