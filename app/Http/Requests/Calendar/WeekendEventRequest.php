<?php

namespace App\Http\Requests\Calendar;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Http\Exceptions\HttpResponseException;
use Illuminate\Contracts\Validation\Validator;

class WeekendEventRequest extends FormRequest
{
    public function authorize()
    {
        return true;
    }

    public function rules()
    {
        return [
            'event_id' => 'required|integer|exists:calendar_events,id',
            // 'user_id' => 'required|integer|exists:users,id',
            'title' => 'required|string|max:50',
            'start_time' => 'required|date_format:Y-m-d\TH:i|before:end_time',
            'end_time' => 'nullable|date_format:Y-m-d\TH:i|after_or_equal:start_time',
            'all_day' => 'boolean',
            'notification' => 'nullable|string|max:100',
            'location' => 'nullable|string|max:100',
            'link' => 'nullable|url|max:500',
            'tag_id' => 'nullable|exists:calendar_tags,id',
            'description' => 'nullable|string|max:1000',
            'recurrence_type' => 'required|in:none,weekday,weekend,weekly,monthly,yearly',
        ];
    }

    public function messages(): array
    {
        return [
            'title.required' => json_encode([
                "code" => "post_title_required",
                "description" => "タイトルは必須です。"
            ]),
            'title.string' => json_encode([
                "code" => "post_title_string",
                "description" => "タイトルは文字列である必要があります。"
            ]),
            'title.max' => json_encode([
                "code" => "post_title_max",
                "description" => "タイトルは50文字以内である必要があります。"
            ]),
            'start_time.required' => json_encode([
                "code" => "post_start_time_required",
                "description" => "開始時間は必須です。"
            ]),
            'start_time.date_format' => json_encode([
                "code" => "post_start_time_date_format",
                "description" => "開始時間は有効な日付形式である必要があります。"
            ]),
            'start_time.before_or_equal' => json_encode([
                "code" => "post_start_time_before_or_equal",
                "description" => "開始時間は終了時間と同じかそれより前である必要があります"
            ]),
            'end_time.date_format' => json_encode([
                "code" => "post_end_time_date_format",
                "description" => "終了時間は有効な日付形式である必要があります。"
            ]),
            'end_time.after_or_equal' => json_encode([
                "code" => "post_end_time_after_or_equal",
                "description" => "終了時間は開始時間と同じかそれ以降である必要があります。"
            ]),
            'all_day.boolean' => json_encode([
                "code" => "post_all_day_boolean",
                "description" => "終日フラグは真偽値である必要があります。"
            ]),
            'notification.string' => json_encode([
                "code" => "post_notification_string",
                "description" => "通知は文字列である必要があります。"
            ]),
            'notification.max' => json_encode([
                "code" => "post_notification_max",
                "description" => "通知は100文字以内である必要があります。"
            ]),
            'location.string' => json_encode([
                "code" => "post_location_string",
                "description" => "場所は文字列である必要があります。"
            ]),
            'location.max' => json_encode([
                "code" => "post_location_max",
                "description" => "場所は100文字以内である必要があります。"
            ]),
            'link.url' => json_encode([
                "code" => "post_link_url",
                "description" => "リンクは有効なURLである必要があります。"
            ]),
            'link.max' => json_encode([
                "code" => "post_link_max",
                "description" => "リンクは500文字以内である必要があります。"
            ]),
            'tag_id.exists' => json_encode([
                "code" => "post_tag_id_exists",
                "description" => "指定されたタグIDは存在しません。"
            ]),
            'description.string' => json_encode([
                "code" => "post_description_string",
                "description" => "説明は文字列である必要があります。"
            ]),
            'description.max' => json_encode([
                "code" => "post_description_max",
                "description" => "説明は1000文字以内である必要があります。"
            ]),
            'recurrence_type.required' => json_encode([
                "code" => "post_recurrence_type_required",
                "description" => "繰り返しの種類は必須です。"
            ]),
            'recurrence_type.in' => json_encode([
                "code" => "post_recurrence_type_in",
                "description" => "繰り返しの種類は有効な値である必要があります。"
            ]),
        ];
    }

    protected function failedValidation(Validator $validator)
    {
        // フィールドごとにエラーメッセージを構築
        $errors = $validator->errors()->getMessages();
        $response = [];
    
        foreach ($errors as $field => $messages) {
            $response[$field] = array_map(function ($message) {
                $decodedMessage = json_decode($message, true);
                return $decodedMessage['description'] ?? $message;
            }, $messages);
        }
    
        if ($this->expectsJson()) {
            throw new HttpResponseException(
                response()->json(['errors' => $response], 422)
            );
        }
    
        // HTMLリクエストの場合のリダイレクト
        throw new HttpResponseException(
            back()->withErrors($response)->withInput()
        );
    }
}