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
                "code" => "post_signup_email_required",
                "description" => "メールアドレスを入力してください"
            ]),
            'email.email' => json_encode([
                "code" => "post_signup_email_invalid",
                "description" => "有効なメールアドレスを入力してください"
            ]),
            'email.exists' => json_encode([
                "code" => "post_signup_email_not_found",
                "description" => "メールアドレスが存在しません"
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