<?php

namespace App\Http\Requests\Auth;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Facades\Hash;
use Illuminate\Contracts\Validation\Validator;
use Illuminate\Http\Exceptions\HttpResponseException;
use App\Models\User;

class LoginRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     *
     * @return bool
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\Rule|array|string>
     */
    public function rules(): array
    {
        return [
            'login_id' => ['required', 'string'],
            'password' => ['required', 'string'],
        ];
    }

    /**
     * Get the error messages for the defined validation rules.
     *
     * @return array<string, string>
     */
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

    /**
     * Handle a failed validation attempt.
     *
     * @param  \Illuminate\Contracts\Validation\Validator  $validator
     * @return void
     *
     * @throws \Illuminate\Validation\ValidationException
     */
    protected function failedValidation(Validator $validator)
    {
        $errors = $validator->errors()->getMessages();
        $response = [];

        // バリデーションエラーの整形
        foreach ($errors as $field => $messages) {
            $response[$field] = array_map(function ($message) {
                $decodedMessage = json_decode($message, true);
                return $decodedMessage['description'] ?? $message;
            }, $messages);
        }

        // 認証エラーの処理
        $user = $this->attemptLogin();
        if (!$user) {
            $response['login'] = [
                "code" => "post_login_invalid_credentials",
                "description" => "ユーザIDまたはパスワードが違います"
            ];
            throw new HttpResponseException(
                response()->json(['errors' => $response], 400)
            );
        }

        // バリデーションエラーをJSON形式で返す
        throw new HttpResponseException(
            response()->json(['errors' => $response], 422)
        );
    }

    /**
     * Attempt to authenticate the request's credentials.
     *
     * @return \App\Models\User|null
     */
    private function attemptLogin(): ?User
    {
        $user = User::where('login_id', $this->input('login_id'))->first();
        if (!$user || !Hash::check($this->input('password'), $user->password)) {
            return null;
        }

        if (!$user->isValid()) {
            return null;
        }

        return $user;
    }
}