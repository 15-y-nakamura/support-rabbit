<?php

namespace App\Http\Requests\Profile;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Http\Exceptions\HttpResponseException;
use Illuminate\Contracts\Validation\Validator;
use Illuminate\Support\Facades\Hash;

class DeleteProfileRequest extends FormRequest
{
    public function authorize()
    {
        return true; 
    }

    public function rules()
    {
        return [
            'password' => ['required', 'string'],
        ];
    }

    public function messages()
    {
        return [
            'password.required' => json_encode([
                "code" => "put_profile_password_required",
                "description" => "パスワードを入力してください"
            ]),
            'password.string' => json_encode([
                "code" => "put_profile_password_invalid",
                "description" => "有効なパスワードを入力してください"
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
