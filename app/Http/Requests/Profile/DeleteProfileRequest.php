<?php

namespace App\Http\Requests\Profile;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Http\Exceptions\HttpResponseException;
use Illuminate\Contracts\Validation\Validator;
use Illuminate\Support\Facades\Hash;

class DeleteProfileRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     *
     * @return bool
     */
    public function authorize()
    {
        return true; // ユーザーがログインしていることを前提とする
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array
     */
    public function rules()
    {
        return [
            'password' => ['required', 'string'],
        ];
    }

    /**
     * Get custom error messages for validation rules.
     *
     * @return array
     */
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

    /**
     * Handle a failed validation attempt.
     *
     * @param Validator $validator
     * @throws HttpResponseException
     */
    protected function failedValidation(Validator $validator)
    {
        $errors = $validator->errors()->getMessages();
        $response = [];

        foreach ($errors as $field => $messages) {
            $response[$field] = array_map(function ($message) {
                $decodedMessage = json_decode($message, true);
                return $decodedMessage['description'] ?? $message;
            }, $messages);
        }

        throw new HttpResponseException(
            response()->json(['errors' => $response], 422)
        );
    }
}
