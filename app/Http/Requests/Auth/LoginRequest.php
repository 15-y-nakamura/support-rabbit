<?php

namespace App\Http\Requests\Auth;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Facades\Hash;
use App\Models\User;
use Illuminate\Contracts\Validation\Validator;
use Illuminate\Http\Exceptions\HttpResponseException;

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
     * Configure the validator instance.
     *
     * @param  \Illuminate\Contracts\Validation\Validator  $validator
     * @return void
     */
    public function withValidator($validator)
    {
        $validator->after(function ($validator) {
            $user = $this->login();
            if ($user) {
                $this->merge(['user' => $user]);
            } else {
                $validator->errors()->add('login_id', 'IDまたはPWが違います');
            }
        });
    }

    /**
     * Attempt to authenticate the request's credentials.
     *
     * @return \App\Models\User|null
     */
    private function login(): ?User
    {
        $user = User::where('login_id', $this->input('login_id'))->first();
        if (!$user) {
            return null;
        }
        if (!Hash::check($this->input('password'), $user->password)) {
            return null;
        }
        if (!$user->isValid()) {
            return null;
        }
        return $user;
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
        throw new HttpResponseException(response()->json([
            'errors' => [
                [
                    'code' => 'post_login_invalid_id_or_password',
                    'description' => 'IDまたはPWが違います'
                ]
            ]
        ], 400));
    }
}
