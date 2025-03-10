<?php

namespace App\Http\Requests\Profile;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Http\Exceptions\HttpResponseException;
use Illuminate\Contracts\Validation\Validator;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Auth;

class PasswordUpdateRequest extends FormRequest
{
    public function authorize()
    {
        return true;
    }

    public function rules()
    {
        return [
            'current_password' => ['required', function ($attribute, $value, $fail) {
                if (!Hash::check($value, Auth::user()->password)) {
                    $fail(json_encode([
                        "code" => "put_profile_current_password_invalid",
                        "description" => "現在のパスワードが間違っています"
                    ]));
                }
            }],
            'password' => ['required', 'confirmed', 'regex:/^[a-zA-Z0-9@#\$%!\^&*]+$/', 'min:8', 'max:30'],
        ];
    }

    public function messages()
    {
        return [
            'current_password.required' => json_encode([
                "code" => "put_profile_current_password_required",
                "description" => "現在のパスワードを入力してください"
            ]),
            'password.required' => json_encode([
                "code" => "put_profile_password_required",
                "description" => "パスワードを入力してください"
            ]),
            'password.regex' => json_encode([
                "code" => "put_profile_password_invalid_characters",
                "description" => "使用可能な文字は半角英数および記号(@, #, $, %, !, ^, &, *)のみです"
            ]),
            'password.min' => json_encode([
                "code" => "put_profile_password_invalid_length",
                "description" => "半角英数8〜30文字以内で入力してください"
            ]),
            'password.max' => json_encode([
                "code" => "put_profile_password_invalid_length",
                "description" => "半角英数8〜30文字以内で入力してください"
            ]),
            'password.confirmed' => json_encode([
                "code" => "put_profile_password_confirmation_mismatch",
                "description" => "パスワードが一致しません"
            ]),
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
