<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Carbon\Carbon;
use Illuminate\Support\Str;
use APIResponse;
use Illuminate\Support\Facades\Log;

class UserToken extends Model
{
    use HasFactory;

    const FROZEN_STATUS = 'frozen'; 

    protected $primaryKey = 'id';
    public $incrementing = false;

    protected $fillable = [
        'user_id',
        'token',
        'expiration_time',
    ];

    protected $hidden = [
        'token'
    ];

    protected $appends = ['frozen', 'createdAt'];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function createToken(User $user)
    {
        // 古いトークンを削除
        self::where('user_id', $user->id)->delete();

        // 新しいトークンを生成
        do {
            $this->token = Str::random(128);
        } while (self::where('token', $this->token)->exists());

        $this->expiration_time = now()->addMonth();
        $this->user_id = $user->id;
        $this->saveOrFail();
        return $this->token; 
    }

    public static function checkToken($token)
    {
        try {
            $userToken = UserToken::where('token', $token)->first();
            if (!$userToken || now() > $userToken->expiration_time) {
                return response([], 200);
            }
            return $userToken->user;
        } catch (\Exception $e) {
            return response([], 500);
        }
    }

    public function getFrozenAttribute()
    {
        return $this->status === self::FROZEN_STATUS;
    }

    public function getCreatedAtAttribute($value)
    {
        return Carbon::parse($value)->format('Y/m/d H:i');
    }

    public static function deleteExistingToken(User $user): void
    {
        if ($user->user_token) {
            $user->user_token->delete();
        }
    }

    public static function createUserToken(User $user): UserToken
    {
        $token = new UserToken();
        $token->createToken($user);
        return $token;
    }
}