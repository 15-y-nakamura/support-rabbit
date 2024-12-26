<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Illuminate\Support\Facades\Hash;
use App\Notifications\CustomResetPasswordNotification;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasFactory, Notifiable, HasApiTokens;

    const NORMAL_STATUS = 1;
    const FROZEN_STATUS = 0; // 例: 凍結状態を示す定数
    const DELETED_STATUS = 9;

    protected $fillable = [
        'login_id',
        'nickname',
        'password',
        'email',
        'birthday',
        'status'
    ];

    protected $casts = [
        'status' => 'int',
        'email_verified_at' => 'datetime',
        'password' => 'hashed',
        'birthday' => 'date',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected $attributes = [
        'status' => self::NORMAL_STATUS,
    ];

    public function user_info()
    {
        return [
            'id' => $this->id,
            'userId' => $this->login_id,
            'nickname' => $this->nickname,
            'email' => $this->email,
            'birthday' => $this->birthday,
            'frozen' => $this->status === self::FROZEN_STATUS,
            'createdAt' => $this->created_at->format('Y/m/d H:i')
        ];
    }

    public function user_token()
    {
        return $this->hasOne(UserToken::class);
    }

    public function contributor()
    {
        return [
            'id' => $this->login_id,
            'nickname' => $this->nickname,
            'email' => $this->email,
            'birthday' => $this->birthday,
        ];
    }

    public function scopeKeyword($query, $word)
    {
        return $query->where(function ($query) use ($word) {
            $query->where('login_id', 'like', '%' . $word . '%')
                ->orwhere('nickname', 'like', '%' . $word . '%')
                ->orwhere('email', 'like', '%' . $word . '%');
        });
    }

    public function scopeVisible($query)
    {
        // NORMAL_STATUS のユーザーのみを取得するスコープ
        return $query->where('status', self::NORMAL_STATUS);
    }

    public function isValid()
    {
        return $this->status === self::NORMAL_STATUS;
    }

    public function createUser($id, $nickname, $password, $email, $birthday)
    {
        $this->login_id = $id;
        $this->nickname = $nickname;
        $this->password = Hash::make($password);
        $this->email = $email;
        $this->birthday = $birthday;
        return $this->saveOrFail();
    }

    public function updateProfile($nickname, $email, $birthday, $login_id)
    {
        $this->nickname = $nickname;
        $this->email = $email;
        $this->birthday = $birthday; // birthdayを更新
        $this->login_id = $login_id; // login_idを更新
        return $this->saveOrFail();
    }

    public function updatePassword($password)
    {
        $this->password = Hash::make($password);
        return $this->saveOrFail();
    }

    public function setStatusToDeleted()
    {
        $this->status = self::DELETED_STATUS;
        return $this->saveOrFail();
    }

    public function setFrozenStatus($isFrozen)
    {
        $this->status = $isFrozen ? self::FROZEN_STATUS : self::NORMAL_STATUS;
        return $this->saveOrFail();
    }

    /**
     * パスワードリセット通知を送信
     *
     * @param  string  $token
     * @return void
     */
    public function sendPasswordResetNotification($token)
    {
        $this->notify(new CustomResetPasswordNotification($token));
    }
}
