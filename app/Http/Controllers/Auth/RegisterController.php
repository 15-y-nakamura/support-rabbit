<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\RegisterRequest;
use App\Models\User;
use Illuminate\Auth\Events\Registered;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;
use Inertia\Response;
use Exception;

class RegisterController extends Controller
{
    /**
     * 登録処理
     */
    public function store(RegisterRequest $request)
    {
        $user = User::create([
            'login_id' => $request->login_id,
            'nickname' => $request->nickname,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'birthday' => $request->birthday,
        ]);

        event(new Registered($user));

        Auth::login($user);

        Log::info('ユーザー登録が正常に完了しました', ['user_id' => $user->id]);

        return Inertia::render('Auth/RegisterForm', [
            'registrationSuccess' => true,
        ]);
    }
}