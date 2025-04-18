<?php

namespace App\Http\Requests\Auth;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Http\Exceptions\HttpResponseException;
use Illuminate\Contracts\Validation\Validator;
use Illuminate\Support\Facades\Hash;
use App\Models\User;

class ResetPasswordRequest extends FormRequest
{
    public function authorize()
    {
        return true;
    }

    public function rules()
    {
        return [
            'token' => 'required',
            'password' => ['required', 'confirmed', 'regex:/^[a-zA-Z0-9@#\$%!\^&*]+$/', 'min:8', 'max:30'],
        ];
    }

    public function messages()
    {
        return [
            'token.required' => json_encode([
                "code" => "post_reset_token_required",
                "description" => "トークンが必要です"
            ]),
            'password.required' => json_encode([
                "code" => "post_signup_password_required",
                "description" => "パスワードを入力してください"
            ], ),
            'password.regex' => json_encode([
                "code" => "post_signup_password_invalid_characters",
                "description" => "使用可能な文字は半角英数および記号(@, #, $, %, !, ^, &, *)のみです"
            ], ),
            'password.min' => json_encode([
                "code" => "post_signup_password_invalid_length",
                "description" => "半角英数8〜30文字以内で入力してください"
            ], ),
            'password.max' => json_encode([
                "code" => "post_signup_password_invalid_length",
                "description" => "半角英数8〜30文字以内で入力してください"
            ], ),
        ];
    }

    protected function failedValidation(Validator $validator)
    {
        $validationErrors = $validator->errors()->getMessages();
        $formattedErrors = [];
    
        foreach ($validationErrors as $field => $messages) {
            $formattedErrors[$field] = array_map(function ($message) {
                $decodedMessage = json_decode($message, true);
                return $decodedMessage['description'];
            }, $messages);
        }
    
        throw new HttpResponseException(
            back()->withErrors($formattedErrors)->withInput()
        );
    }
}