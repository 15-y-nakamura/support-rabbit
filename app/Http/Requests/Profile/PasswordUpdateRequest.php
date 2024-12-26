<?php

namespace App\Http\Requests\Profile;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Http\Exceptions\HttpResponseException;
use Illuminate\Contracts\Validation\Validator;

class PasswordUpdateRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     *
     * @return bool
     */
    public function authorize()
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array
     */
    public function rules()
    {
        return [
            'password' => ['required', 'regex:/^[a-zA-Z0-9]+$/', 'min:8', 'max:12'],
        ];
    }

    public function messages()
    {
        return [
            'password.required' => json_encode([
                "code" => "put_profile_password_invalid_length",
                "description" => "半角英数8〜12文字以内で入力してください"
            ]),
            'password.regex' => json_encode([
                "code" => "put_profile_password_invalid_characters",
                "description" => "そのパスワードは使用できません"
            ]),
            'password.min' => json_encode([
                "code" => "put_profile_password_invalid_length",
                "description" => "半角英数8〜12文字以内で入力してください"
            ]),
            'password.max' => json_encode([
                "code" => "put_profile_password_invalid_length",
                "description" => "半角英数8〜12文字以内で入力してください"
            ]),
        ];
    }

    /**
     * Handle Failed
     *
     * @param Validator $validator
     * @throw HttpResponseException
     * @see FormRequest::failedValidation()
     */
    protected function failedValidation(Validator $validator)
    {
        $response = array_map(function ($error) {
            return json_decode($error, true);
        }, $validator->errors()->all());
        throw new HttpResponseException(response()->json(["errors" => $response], 400));
    }
}
