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

    const FROZEN_STATUS = 'frozen'; // 定数を追加

    protected $primaryKey = 'user_id';
    public $incrementing = false;

    protected $fillable = [
        'token',
        'expiration_time'
    ];

    protected $hidden = [
        'token'
    ];

    protected $appends = ['frozen', 'createdAt']; // アクセサを追加

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function createToken(User $user)
    {
        while (!$this->token || self::where('token', $this->token)->exists()) {
            $this->token = Str::random(128);
        }
        $this->expiration_time = now()->addMonth();
        $this->user_id = $user->id;
        $this->saveOrFail();
        return $this->token; // トークンを返す
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

    // アクセサを追加
    public function getFrozenAttribute()
    {
        return $this->status === self::FROZEN_STATUS;
    }

    public function getCreatedAtAttribute($value)
    {
        return Carbon::parse($value)->format('Y/m/d H:i');
    }
}
