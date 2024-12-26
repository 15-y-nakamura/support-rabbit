<?php

namespace App\Http\Requests\Auth;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Http\Exceptions\HttpResponseException;
use Illuminate\Contracts\Validation\Validator;

class RegisterRequest extends FormRequest
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
            'login_id' => ['required', 'regex:/^[0-9a-zA-Z_]+$/', 'unique:users,login_id', 'max:15'],
            'nickname' => ['required', 'regex:/^[ぁ-んァ-ンーa-zA-Z0-9一-龠０-９\-\r]+$/', 'max:15'],
            'email' => ['required', 'string', 'lowercase', 'email', 'max:255', 'unique:users'],
            'password' => ['required', 'confirmed', 'regex:/^[a-zA-Z0-9]+$/', 'min:8', 'max:12'],
            'birthday' => ['nullable', 'date'],
        ];
    }

    /**
     * Get custom error messages for validator errors.
     *
     * @return array
     */
    public function messages()
    {
        return [
            'login_id.required' => json_encode([
                "code" => 'post_signup_id_invalid_length',
                "description" => "半角英数1〜15文字以内で入力してください"
            ]),
            'login_id.regex' => json_encode([
                "code" => "post_signup_id_invalid_characters",
                "description" => "半角英数以外は使用できません"
            ]),
            'login_id.unique' => json_encode([
                "code" => "post_signup_id_already_used",
                "description"=> "既に使用されているIDです"
            ]),
            'login_id.max' => json_encode([
                "code" => "post_signup_id_invalid_length",
                "description" => "半角英数1〜15文字以内で入力してください"
            ]),
            'nickname.required' => json_encode([
                "code" => "post_signup_nickname_invalid_length",
                "description" => "1〜15文字以内で入力してください"
            ]),
            'nickname.regex' => json_encode([
                "code" => "post_signup_nickname_invalid_characters",
                "description" => "特殊記号は使用できません"
            ]),
            'nickname.max' => json_encode([
                "code" => "post_signup_nickname_invalid_length",
                "description" => "1〜15文字以内で入力してください"
            ]),
            'email.required' => json_encode([
                "code" => "post_signup_email_required",
                "description" => "メールアドレスを入力してください"
            ]),
            'email.string' => json_encode([
                "code" => "post_signup_email_invalid",
                "description" => "有効なメールアドレスを入力してください"
            ]),
            'email.lowercase' => json_encode([
                "code" => "post_signup_email_invalid",
                "description" => "メールアドレスは小文字で入力してください"
            ]),
            'email.email' => json_encode([
                "code" => "post_signup_email_invalid",
                "description" => "有効なメールアドレスを入力してください"
            ]),
            'email.max' => json_encode([
                "code" => "post_signup_email_invalid_length",
                "description" => "メールアドレスは255文字以内で入力してください"
            ]),
            'email.unique' => json_encode([
                "code" => "post_signup_email_already_used",
                "description" => "既に使用されているメールアドレスです"
            ]),
            'password.required' => json_encode([
                "code" => "post_signup_password_invalid_length",
                "description" => "半角英数8〜12文字以内で入力してください"
            ]),
            'password.regex' => json_encode([
                "code" => "post_signup_password_invalid_characters",
                "description" => "そのパスワードは使用できません"
            ]),
            'password.min' => json_encode([
                "code" => "post_signup_password_invalid_length",
                "description" => "半角英数8〜12文字以内で入力してください"
            ]),
            'password.max' => json_encode([
                "code" => "post_signup_password_invalid_length",
                "description" => "半角英数8〜12文字以内で入力してください"
            ]),
            'birthday.date' => json_encode([
                "code" => "post_signup_birthday_invalid",
                "description" => "有効な日付を入力してください"
            ]),
        ];
    }

    /**
     * Handle a failed validation attempt.
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
