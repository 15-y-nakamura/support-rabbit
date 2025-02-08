<?php

namespace App\Http\Requests\Auth;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Http\Exceptions\HttpResponseException;
use Illuminate\Contracts\Validation\Validator;

class ForgotPasswordRequest extends FormRequest
{
    public function authorize()
    {
        return true;
    }

    public function rules()
    {
        return [
            'email' => 'required|email|exists:users,email',
        ];
    }

    public function messages()
    {
        return [
            'email.required' => json_encode([
                "code" => "forgot_password_email_required",
                "description" => "メールアドレスを入力してください"
            ]),
            'email.email' => json_encode([
                "code" => "forgot_password_email_invalid",
                "description" => "有効なメールアドレスを入力してください"
            ]),
            'email.exists' => json_encode([
                "code" => "forgot_password_email_not_found",
                "description" => "メールアドレスが存在しません"
            ]),
        ];
    }

    protected function failedValidation(Validator $validator)
    {
        // バリデーションエラーメッセージを取得
        $validationErrors = $validator->errors()->getMessages();
        $formattedErrors = [];
    
        foreach ($validationErrors as $field => $messages) {
            $formattedErrors[$field] = array_map(function ($message) {
                $decodedMessage = json_decode($message, true);
                return $decodedMessage['description'] ?? $message;
            }, $messages);
        }
    
        // JSONリクエストの場合はエラーレスポンスを返す
        if ($this->expectsJson()) {
            throw new HttpResponseException(
                response()->json(['errors' => $formattedErrors], 422)
            );
        }
    
        // HTMLリクエストの場合はリダイレクトし、エラーメッセージを表示
        throw new HttpResponseException(
            back()->withErrors($formattedErrors)->withInput()
        );
    }
}