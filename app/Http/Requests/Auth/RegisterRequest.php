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
                "description" => "半角英数1〜30文字以内で入力してください"
            ], JSON_UNESCAPED_UNICODE),
            'login_id.regex' => json_encode([
                "code" => "post_signup_id_invalid_characters",
                "description" => "半角英数以外は使用できません"
            ], JSON_UNESCAPED_UNICODE),
            'login_id.unique' => json_encode([
                "code" => "post_signup_id_already_used",
                "description" => "既に使用されているIDです"
            ], JSON_UNESCAPED_UNICODE),
            'login_id.max' => json_encode([
                "code" => "post_signup_id_invalid_length",
                "description" => "半角英数1〜30文字以内で入力してください"
            ], JSON_UNESCAPED_UNICODE),
            'nickname.required' => json_encode([
                "code" => "post_signup_nickname_invalid_length",
                "description" => "1〜15文字以内で入力してください"
            ], JSON_UNESCAPED_UNICODE),
            'nickname.regex' => json_encode([
                "code" => "post_signup_nickname_invalid_characters",
                "description" => "特殊記号は使用できません"
            ], JSON_UNESCAPED_UNICODE),
            'nickname.max' => json_encode([
                "code" => "post_signup_nickname_invalid_length",
                "description" => "1〜15文字以内で入力してください"
            ], JSON_UNESCAPED_UNICODE),
            'email.required' => json_encode([
                "code" => "post_signup_email_required",
                "description" => "メールアドレスを入力してください"
            ], JSON_UNESCAPED_UNICODE),
            'email.string' => json_encode([
                "code" => "post_signup_email_invalid",
                "description" => "有効なメールアドレスを入力してください"
            ], JSON_UNESCAPED_UNICODE),
            'email.lowercase' => json_encode([
                "code" => "post_signup_email_invalid",
                "description" => "メールアドレスは小文字で入力してください"
            ], JSON_UNESCAPED_UNICODE),
            'email.email' => json_encode([
                "code" => "post_signup_email_invalid",
                "description" => "有効なメールアドレスを入力してください"
            ], JSON_UNESCAPED_UNICODE),
            'email.max' => json_encode([
                "code" => "post_signup_email_invalid_length",
                "description" => "メールアドレスは255文字以内で入力してください"
            ], JSON_UNESCAPED_UNICODE),
            'email.unique' => json_encode([
                "code" => "post_signup_email_already_used",
                "description" => "既に使用されているメールアドレスです"
            ], JSON_UNESCAPED_UNICODE),
            'password.required' => json_encode([
                "code" => "post_signup_password_invalid_length",
                "description" => "半角英数8〜30文字以内で入力してください"
            ], JSON_UNESCAPED_UNICODE),
            'password.regex' => json_encode([
                "code" => "post_signup_password_invalid_characters",
                "description" => "使用可能な文字は半角英数および記号(@, #, $, %, !, ^, &, *)のみです"
            ], JSON_UNESCAPED_UNICODE),
            'password.min' => json_encode([
                "code" => "post_signup_password_invalid_length",
                "description" => "半角英数8〜30文字以内で入力してください"
            ], JSON_UNESCAPED_UNICODE),
            'password.max' => json_encode([
                "code" => "post_signup_password_invalid_length",
                "description" => "半角英数8〜30文字以内で入力してください"
            ], JSON_UNESCAPED_UNICODE),
            'password.confirmed' => json_encode([
                "code" => "post_signup_password_confirmation_mismatch",
                "description" => "パスワードと確認フィールドが一致していません。"
            ], JSON_UNESCAPED_UNICODE),
            'birthday.date' => json_encode([
                "code" => "post_signup_birthday_invalid",
                "description" => "有効な日付を入力してください"
            ], JSON_UNESCAPED_UNICODE),
        ];
    }

    protected function failedValidation(Validator $validator)
    {
        // フィールドごとにエラーメッセージを構築
        $errors = $validator->errors()->getMessages();
        $response = [];
    
        foreach ($errors as $field => $messages) {
            $response[$field] = array_map(function ($message) {
                $decodedMessage = json_decode($message, true);
                return $decodedMessage['description'] ?? $message;
            }, $messages);
        }
    
        if ($this->expectsJson()) {
            throw new HttpResponseException(
                response()->json(['errors' => $response], 422)
            );
        }
    
        // HTMLリクエストの場合のリダイレクト
        throw new HttpResponseException(
            back()->withErrors($response)->withInput()
        );
    }
}
