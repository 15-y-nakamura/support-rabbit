<?php

namespace App\Http\Requests\Profile;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Http\Exceptions\HttpResponseException;
use Illuminate\Contracts\Validation\Validator;
use Illuminate\Validation\Rule;
use App\Models\User;

class ProfileUpdateRequest extends FormRequest
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
            'nickname' => ['required', 'string', 'max:255'],
            'login_id' => [
                'required',
                'string',
                'max:255',
                Rule::unique(User::class)->ignore($this->user()->id), // ログインIDの一意性をチェック
            ],
            'email' => [
                'required',
                'string',
                'lowercase',
                'email',
                'max:255',
                Rule::unique(User::class)->ignore($this->user()->id),
            ],
            'birthday' => ['nullable', 'date'],
        ];
    }

    public function messages()
    {
        return [
            'nickname.required' => json_encode([
                "code" => "put_profile_nickname_invalid_length",
                "description" => "1〜255文字以内で入力してください"
            ]),
            'login_id.required' => json_encode([
                "code" => "put_profile_login_id_required",
                "description" => "ログインIDは必須です"
            ]),
            'login_id.unique' => json_encode([
                "code" => "put_profile_login_id_unique",
                "description" => "このログインIDは既に使用されています"
            ]),
            'email.required' => json_encode([
                "code" => "put_profile_email_required",
                "description" => "メールアドレスは必須です"
            ]),
            'email.email' => json_encode([
                "code" => "put_profile_email_invalid",
                "description" => "有効なメールアドレスを入力してください"
            ]),
            'email.unique' => json_encode([
                "code" => "put_profile_email_unique",
                "description" => "このメールアドレスは既に使用されています"
            ]),
            'birthday.date' => json_encode([
                "code" => "put_profile_birthday_invalid",
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
