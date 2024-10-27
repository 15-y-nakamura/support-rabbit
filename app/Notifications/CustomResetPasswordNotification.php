<?php

namespace App\Notifications;

use Illuminate\Auth\Notifications\ResetPassword;
use Illuminate\Notifications\Messages\MailMessage;

class CustomResetPasswordNotification extends ResetPassword
{
    /**
     * パスワードリセット通知メールの内容を定義
     *
     * @param mixed $notifiable
     * @return \Illuminate\Notifications\Messages\MailMessage
     */
    public function toMail($notifiable)
    {
        return (new MailMessage)
            ->subject('パスワードリセットのお知らせ')
            ->greeting("こんにちは、{$notifiable->nickname} さん！")
            ->line("あなたのユーザIDは {$notifiable->login_id} です。")
            ->line('以下のボタンをクリックして、パスワードリセット手続きを完了してください。')
            ->action('パスワードをリセットする', url(route('password.reset', $this->token, false)))
            ->line('このメールは ' . $notifiable->email . ' 宛に送信されています。')
            ->line('もしこのメールに心当たりがない場合は、操作は不要です。');
    }
}
