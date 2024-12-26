<?php

namespace App\Lib;

class APIResponse {
    /**
     * 汎用エラーのレスポンスを作成
     *
     * @return \Illuminate\Http\Response
     */
    public static function generalError() {
        return response([ "errors" => [[
            "code" => "general",
            "description" => "リクエストが不正です",
        ]]], 400);
    }

    /**
     * 成功時のレスポンスを作成
     *
     * @return \Illuminate\Http\Response
     */
    public static function success() {
        return response()->json(["message" => "ok"], 200);
    }

    /**
     * ユーザーが見つからないエラーレスポンスを作成
     *
     * @return \Illuminate\Http\Response
     */
    public static function userNotFound() {
        return response()->json(["errors" => [[
            "code" => "user_not_found",
            "description" => "ユーザーが見つかりません"
        ]]], 404);
    }

    /**
     * ユーザーが既に存在するエラーレスポンスを作成
     *
     * @return \Illuminate\Http\Response
     */
    public static function userAlreadyExists() {
        return response()->json(["errors" => [[
            "code" => "user_already_exists",
            "description" => "既に使用されているIDです"
        ]]], 400);
    }

    /**
     * パスワードが間違っているエラーレスポンスを作成
     *
     * @return \Illuminate\Http\Response
     */
    public static function incorrectPassword() {
        return response()->json(["errors" => [[
            "code" => "incorrect_password",
            "description" => "パスワードが間違っています"
        ]]], 400);
    }

    /**
     * メールアドレスが見つからないエラーレスポンスを作成
     *
     * @return \Illuminate\Http\Response
     */
    public static function emailNotFound() {
        return response()->json(["errors" => [[
            "code" => "email_not_found",
            "description" => "メールアドレスが見つかりません"
        ]]], 404);
    }

    /**
     * エラーコードからエラーレスポンス作成
     */
    public static function errorWithCode($code) {
        switch($code) {
            case 1:
                return response(["details" => [[
                    "code" => 1,
                    "description" => "接続に失敗しました"
                ]]], 500);
            case 2:
                return response(["details" => [[
                    "code" => 2,
                    "description" => "接続に失敗しました"
                ]]], 500);
            case 3:
                return response(["details" => [[
                    "code" => 3,
                    "description" => "再度ログインしてください"
                ]]], 401);
            case 4:
                return response(["details" => [[
                    "code" => 4,
                    "description" => "入力されたデータに誤りがあります"
                ]]], 400);
            case 5:
                return response(["details" => [[
                    "code" => 5,
                    "description" => "メールアドレスまたはパスワードが違います"
                ]]], 401);
            case 6:
                return response(["details" => [[
                    "code" => 6,
                    "description" => "このアカウントは利用できません。"
                ]]], 401);
            case 7:
                return response(["details" => [[
                    "code" => 7,
                    "description" => "メールアドレスが見つかりません"
                ]]], 404);
            case 8:
                return response(["details" => [[
                    "code" => 8,
                    "description" => "管理者が見つかりません"
                ]]], 404);
            case 9:
                return response(["details" => [[
                    "code" => 9,
                    "description" => "ユーザーが見つかりません"
                ]]], 404);
            case 10:
                return response(["details" => [[
                    "code" => 10,
                    "description" => "パスワードが間違っています"
                ]]], 400);
            case 11:
                return response(["details" => [[
                    "code" => 11,
                    "description" => "リセットトークンが無効です"
                ]]], 401);
            default:
                return response(["details" => [[
                    "code" => $code,
                    "description" => "エラーが発生しました"
                ]]], 400);
        }
    }
}
