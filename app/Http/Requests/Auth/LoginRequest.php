<?php

namespace App\Http\Requests\Auth;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Facades\Hash;
use Illuminate\Contracts\Validation\Validator;
use Illuminate\Http\Exceptions\HttpResponseException;
use App\Models\User;

class LoginRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'login_id' => ['required', 'string'],
            'password' => ['required', 'string'],
        ];
    }

    public function messages(): array
    {
        return [
            'login_id.required' => json_encode([
                "code" => "post_login_id_required",
                "description" => "ユーザIDを入力してください"
            ]),
            'password.required' => json_encode([
                "code" => "post_login_password_required",
                "description" => "パスワードを入力してください"
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
                return $decodedMessage['description'] ?? $message;
            }, $messages);
        }

        throw new HttpResponseException(
            response()->json(['errors' => $formattedErrors], 422)
        );
    }
}