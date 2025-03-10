<?php

namespace App\Http\Requests\Profile;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Http\Exceptions\HttpResponseException;
use Illuminate\Contracts\Validation\Validator;
use Illuminate\Validation\Rule;
use App\Models\User;
use Illuminate\Support\Facades\Auth;

class ProfileUpdateRequest extends FormRequest
{
    public function authorize()
    {
        return true;
    }

    public function rules()
    {
        $user = Auth::user();

        // 入力値と現在の値を比較し、変更がある場合のみバリデーションを適用
        $rules = [];

        if ($this->filled('login_id') && $this->input('login_id') !== $user->login_id) {
            $rules['login_id'] = ['required', 'regex:/^[0-9a-zA-Z_]+$/', 'unique:users,login_id', 'max:30'];
        }

        if ($this->filled('nickname') && $this->input('nickname') !== $user->nickname) {
            $rules['nickname'] = ['required', 'regex:/^[ぁ-んァ-ンーa-zA-Z0-9一-龠０-９\-\r]+$/', 'max:15'];
        }

        if ($this->filled('email') && $this->input('email') !== $user->email) {
            $rules['email'] = ['required', 'string', 'lowercase', 'email', 'max:255', 'unique:users'];
        }

        if ($this->filled('birthday') && $this->input('birthday') !== $user->birthday) {
            $rules['birthday'] = ['nullable', 'date'];
        }

        return $rules;
    }

    public function messages()
    {
        return [
            'login_id.required' => json_encode([
                "code" => 'post_signup_id_invalid_length',
                "description" => "半角英数1〜30文字以内で入力してください"
            ]),
            'login_id.regex' => json_encode([
                "code" => "post_signup_id_invalid_characters",
                "description" => "半角英数以外は使用できません"
            ]),
            'login_id.unique' => json_encode([
                "code" => "post_signup_id_already_used",
                "description" => "既に使用されているIDです"
            ]),
            'login_id.max' => json_encode([
                "code" => "post_signup_id_invalid_length",
                "description" => "半角英数1〜30文字以内で入力してください"
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

            'birthday.date' => json_encode([
                "code" => "post_signup_birthday_invalid",
                "description" => "有効な日付を入力してください"
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
