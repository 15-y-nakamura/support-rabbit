<?php

namespace App\Http\Requests\Calendar;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Http\Exceptions\HttpResponseException;
use Illuminate\Contracts\Validation\Validator;

class TagRequest extends FormRequest
{
    public function authorize()
    {
        return true;
    }

    public function rules()
    {
        return [
            'name' => 'required|string|max:15', // タイトルは15文字以内
            'color' => 'nullable|string|max:7', // カラーコードは7文字以内
        ];
    }

    public function messages(): array
    {
        return [
            'name.required' => json_encode([
                "code" => "post_name_required",
                "description" => "タグのタイトルは必須です"
            ]),
            'name.string' => json_encode([
                "code" => "post_name_string",
                "description" => "タグのタイトルは文字列である必要があります"
            ]),
            'name.max' => json_encode([
                "code" => "post_name_max",
                "description" => "タグのタイトルは15文字以内である必要があります"
            ]),
            'color.string' => json_encode([
                "code" => "post_color_string",
                "description" => "カラーコードは文字列である必要があります"
            ]),
            'color.max' => json_encode([
                "code" => "post_color_max",
                "description" => "カラーコードは7文字以内である必要があります"
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