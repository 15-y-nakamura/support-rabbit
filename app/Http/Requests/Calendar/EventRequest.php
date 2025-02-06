<?php

namespace App\Http\Requests\Calendar;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Http\Exceptions\HttpResponseException;
use Illuminate\Contracts\Validation\Validator;

class EventRequest extends FormRequest
{
    public function authorize()
    {
        return true;
    }

    public function rules()
    {
        return [
            // 'user_id' => 'required|integer|exists:users,id', // 削除
            'title' => 'required|string|max:50',
            'start_time' => 'required|date_format:Y-m-d\TH:i|before_or_equal:end_time', // 修正
            'end_time' => 'nullable|date_format:Y-m-d\TH:i|after_or_equal:start_time',
            'all_day' => 'boolean',
            'location' => 'nullable|string|max:100',
            'link' => 'nullable|url|max:500',
            'tag_id' => 'nullable|exists:calendar_tags,id',
            'note' => 'nullable|string|max:1000',
            'is_recurring' => 'boolean',
            'recurrence_type' => 'required|in:none,weekday,weekend,weekly,monthly,yearly',
        ];
    }

    public function messages(): array
    {
        return [
            // 'user_id.required' => json_encode([
            //     "code" => "post_user_id_required",
            //     "description" => "ユーザーIDは必須です"
            // ]),
            // 'user_id.integer' => json_encode([
            //     "code" => "post_user_id_integer",
            //     "description" => "ユーザーIDは整数である必要があります"
            // ]),
            // 'user_id.exists' => json_encode([
            //     "code" => "post_user_id_exists",
            //     "description" => "指定されたユーザーIDは存在しません"
            // ]),
            'title.required' => json_encode([
                "code" => "post_title_required",
                "description" => "タイトルは必須です"
            ]),
            'title.max' => json_encode([
                "code" => "post_title_max",
                "description" => "タイトルは50文字以内です"
            ]),
            'start_time.required' => json_encode([
                "code" => "post_start_time_required",
                "description" => "開始時間は必須です"
            ]),
            'start_time.date_format' => json_encode([
                "code" => "post_start_time_date_format",
                "description" => "開始時間は有効な日付形式である必要があります"
            ]),
            'start_time.before_or_equal' => json_encode([
                "code" => "post_start_time_before_or_equal",
                "description" => "開始時間は終了時間と同じかそれより前である必要があります"
            ]),
            'end_time.date_format' => json_encode([
                "code" => "post_end_time_date_format",
                "description" => "終了時間は有効な日付形式である必要があります"
            ]),
            'end_time.after_or_equal' => json_encode([
                "code" => "post_end_time_after_or_equal",
                "description" => "終了時間は開始時間と同じかそれ以降である必要があります"
            ]),
            'all_day.boolean' => json_encode([
                "code" => "post_all_day_boolean",
                "description" => "終日フラグは真偽値である必要があります"
            ]),
            'location.string' => json_encode([
                "code" => "post_location_string",
                "description" => "場所は文字列である必要があります"
            ]),
            'location.max' => json_encode([
                "code" => "post_location_max",
                "description" => "場所は100文字以内です"
            ]),
            'link.url' => json_encode([
                "code" => "post_link_url",
                "description" => "リンクは有効なURLである必要があります"
            ]),
            'link.max' => json_encode([
                "code" => "post_link_max",
                "description" => "リンクは500文字以内です"
            ]),
            'tag_id.exists' => json_encode([
                "code" => "post_tag_id_exists",
                "description" => "指定されたタグIDは存在しません"
            ]),
            'note.string' => json_encode([
                "code" => "post_note_string",
                "description" => "メモは文字列である必要があります"
            ]),
            'note.max' => json_encode([
                "code" => "post_note_max",
                "description" => "メモは1000文字以内です"
            ]),
            'is_recurring.boolean' => json_encode([
                "code" => "post_is_recurring_boolean",
                "description" => "繰り返し設定のフラグは真偽値である必要があります"
            ]),
            'recurrence_type.required' => json_encode([
                "code" => "post_recurrence_type_required",
                "description" => "繰り返しの種類は必須です"
            ]),
            'recurrence_type.in' => json_encode([
                "code" => "post_recurrence_type_in",
                "description" => "繰り返しの種類は有効な値である必要があります"
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