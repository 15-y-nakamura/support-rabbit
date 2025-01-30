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

    const NORMAL_STATUS = 1; // 通常
    const FROZEN_STATUS = 0; // 凍結
    const DELETED_STATUS = 9; // 削除済み（論理削除）

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

    /**
     * ユーザー情報を取得
     */
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

    /**
     * ユーザー削除（論理削除）
     */
    public function setStatusToDeleted()
    {
        if ($this->status === self::DELETED_STATUS) {
            return false; // すでに削除済み
        }

        $this->status = self::DELETED_STATUS;
        return $this->save();
    }

    /**
     * ユーザーパスワードを更新
     */
    public function updatePassword($password)
    {
        $this->password = Hash::make($password);
        return $this->save();
    }

    /**
     * ユーザープロフィールを更新
     */
    public function updateProfile($nickname, $email, $birthday, $login_id)
    {
        $this->nickname = $nickname;
        $this->email = $email;
        $this->birthday = $birthday;
        $this->login_id = $login_id;
        return $this->save();
    }
}
