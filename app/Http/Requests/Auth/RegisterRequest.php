<?php
namespace App\Http\Requests\Auth;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Http\Exceptions\HttpResponseException;
use Illuminate\Contracts\Validation\Validator;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;

class RegisterRequest extends FormRequest
{
    public function authorize()
    {
        return true;
    }

    public function rules()
    {
        return [
            'login_id' => ['required', 'regex:/^[0-9a-zA-Z_]+$/', 'unique:users,login_id', 'max:30'],
            'nickname' => ['required', 'regex:/^[ぁ-んァ-ンーa-zA-Z0-9一-龠０-９\-\r]+$/', 'max:15'],
            'email' => ['required', 'string', 'lowercase', 'email', 'max:255', 'unique:users'],
            'password' => ['required', 'confirmed', 'regex:/^[a-zA-Z0-9@#\$%!\^&*]+$/', 'min:8', 'max:30'],
            'birthday' => ['nullable', 'date'],
        ];
    }

    public function messages()
    {
        return [
            'login_id.required' => json_encode([
                "code" => 'post_signup_id_invalid_length',
                "description" => "ユーザIDを入力してください"
            ], ),
            'login_id.regex' => json_encode([
                "code" => "post_signup_id_invalid_characters",
                "description" => "半角英数以外は使用できません"
            ], ),
            'login_id.unique' => json_encode([
                "code" => "post_signup_id_already_used",
                "description" => "既に使用されているIDです"
            ], ),
            'login_id.max' => json_encode([
                "code" => "post_signup_id_invalid_length",
                "description" => "半角英数1〜30文字以内で入力してください"
            ], ),
            'nickname.required' => json_encode([
                "code" => "post_signup_nickname_invalid_length",
                "description" => "ニックネームを入力してください"
            ], ),
            'nickname.regex' => json_encode([
                "code" => "post_signup_nickname_invalid_characters",
                "description" => "特殊記号は使用できません"
            ], ),
            'nickname.max' => json_encode([
                "code" => "post_signup_nickname_invalid_length",
                "description" => "1〜15文字以内で入力してください"
            ], ),
            'email.required' => json_encode([
                "code" => "post_signup_email_required",
                "description" => "メールアドレスを入力してください"
            ], ),
            'email.string' => json_encode([
                "code" => "post_signup_email_invalid",
                "description" => "有効なメールアドレスを入力してください"
            ], ),
            'email.email' => json_encode([
                "code" => "post_signup_email_invalid",
                "description" => "有効なメールアドレスを入力してください"
            ], ),
            'email.max' => json_encode([
                "code" => "post_signup_email_invalid_length",
                "description" => "メールアドレスは255文字以内で入力してください"
            ], ),
            'email.unique' => json_encode([
                "code" => "post_signup_email_already_used",
                "description" => "既に使用されているメールアドレスです"
            ], ),
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
            'password.confirmed' => json_encode([
                "code" => "post_signup_password_confirmation_mismatch",
                "description" => "パスワードと確認フィールドが一致していません。"
            ], ),
            'birthday.date' => json_encode([
                "code" => "post_signup_birthday_invalid",
                "description" => "有効な日付を入力してください"
            ], ),
            'birthday.required' => json_encode([
                "code" => "post_signup_birthday_required",
                "description" => "生年月日を入力してください"
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