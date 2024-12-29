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
            'start_time' => 'required|date',
            'end_time' => 'nullable|date',
            'all_day' => 'boolean',
            'location' => 'nullable|string|max:255',
            'link' => 'nullable|url|max:255',
            'notification' => 'nullable|string|max:255',
            'is_recurring' => 'boolean',
            'recurrence_type' => 'required|in:none,weekday,weekend,weekly,monthly,yearly',
            'latitude' => 'nullable|numeric|between:-90,90',
            'longitude' => 'nullable|numeric|between:-180,180',
            'tags' => 'nullable|array',
            'tags.*' => 'exists:tags,id',
        ];
    }
}
