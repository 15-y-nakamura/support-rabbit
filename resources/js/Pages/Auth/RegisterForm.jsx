import React, { useState } from "react";
import { useForm, Link, Head, usePage } from "@inertiajs/react";
import InputLabel from "@/Components/InputLabel";
import TextInput from "@/Components/TextInput";
import InputError from "@/Components/InputError";
import PrimaryButton from "@/Components/PrimaryButton";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import CircularProgress from "@mui/material/CircularProgress";

export default function RegisterForm() {
    const { data, setData, post, processing, errors, reset } = useForm({
        login_id: "",
        nickname: "",
        email: "",
        password: "",
        password_confirmation: "",
        birthday: "",
    });

    const { props } = usePage();
    const [showPassword, setShowPassword] = useState(false);
    const [showPasswordConfirm, setShowPasswordConfirm] = useState(false);

    // パスワードの可視化トグル（共通化）
    const toggleVisibility = (type) => {
        if (type === "password") setShowPassword((prev) => !prev);
        if (type === "confirm") setShowPasswordConfirm((prev) => !prev);
    };

    const submit = (e) => {
        e.preventDefault();
        post(route("register"), {
            onSuccess: () => reset("password", "password_confirmation"),
        });
    };

    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-[#FFF6EA] pt-6 sm:pt-0">
            {/* ロゴ */}
            <div className="flex justify-center mb-4">
                <img
                    src="/img/logos/logo.png"
                    alt="Logo"
                    className="h-24 sm:h-36"
                    style={{ width: "125px", height: "125px" }}
                />
            </div>

            {/* タイトル */}
            <div className="text-center mb-4">
                <h1 className="text-xl sm:text-2xl font-semibold text-gray-700">
                    初めまして
                </h1>
            </div>
            <Head title="新規登録" />

            <div className="w-full max-w-sm sm:max-w-4xl mx-auto">
                <div className="bg-white shadow-md rounded-lg overflow-hidden">
                    {/* タブ切り替え */}
                    <div className="flex justify-center">
                        <Link
                            href={route("login")}
                            className="w-1/2 py-2 sm:py-4 text-gray-700 font-medium bg-[#FFB6C1] text-center"
                        >
                            ログイン
                        </Link>
                        <button className="w-1/2 py-2 sm:py-4 text-gray-700 font-medium bg-customPink">
                            新規登録
                        </button>
                    </div>

                    {/* フォーム */}
                    <div className="p-4 sm:p-6">
                        <form onSubmit={submit}>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {/* ユーザID */}
                                <FormField
                                    id="login_id"
                                    label="ユーザID"
                                    placeholder="ユーザID"
                                    value={data.login_id}
                                    onChange={(e) =>
                                        setData("login_id", e.target.value)
                                    }
                                    error={errors.login_id}
                                />

                                {/* ニックネーム */}
                                <FormField
                                    id="nickname"
                                    label="ニックネーム"
                                    placeholder="ニックネーム"
                                    value={data.nickname}
                                    onChange={(e) =>
                                        setData("nickname", e.target.value)
                                    }
                                    error={errors.nickname}
                                />

                                {/* メールアドレス */}
                                <FormField
                                    id="email"
                                    type="email"
                                    label="メールアドレス"
                                    placeholder="メールアドレス"
                                    value={data.email}
                                    onChange={(e) =>
                                        setData("email", e.target.value)
                                    }
                                    error={errors.email}
                                />

                                {/* 生年月日 */}
                                <FormField
                                    id="birthday"
                                    type="date"
                                    label="生年月日"
                                    placeholder="yyyy/mm/dd"
                                    value={data.birthday}
                                    onChange={(e) =>
                                        setData("birthday", e.target.value)
                                    }
                                    error={errors.birthday}
                                />

                                {/* パスワード */}
                                <PasswordField
                                    id="password"
                                    label="パスワード"
                                    value={data.password}
                                    onChange={(e) =>
                                        setData("password", e.target.value)
                                    }
                                    error={errors.password}
                                    isVisible={showPassword}
                                    toggleVisibility={() =>
                                        toggleVisibility("password")
                                    }
                                />

                                {/* パスワード確認 */}
                                <PasswordField
                                    id="password_confirmation"
                                    label="パスワード確認"
                                    value={data.password_confirmation}
                                    onChange={(e) =>
                                        setData(
                                            "password_confirmation",
                                            e.target.value
                                        )
                                    }
                                    error={errors.password_confirmation}
                                    isVisible={showPasswordConfirm}
                                    toggleVisibility={() =>
                                        toggleVisibility("confirm")
                                    }
                                />
                            </div>

                            {/* ボタン */}
                            <div className="mt-4 flex items-center justify-between">
                                <Link
                                    href={route("login")}
                                    className="rounded-md text-sm text-gray-600 underline hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                                >
                                    既にアカウントをお持ちの方はこちら
                                </Link>

                                <div className="flex items-center">
                                    {props.registrationSuccess && (
                                        <span className="text-green-500 text-sm mr-4">
                                            登録が完了しました
                                        </span>
                                    )}
                                    <PrimaryButton
                                        className="ml-4 bg-gray-700 flex items-center justify-center"
                                        disabled={processing}
                                    >
                                        {processing ? (
                                            <CircularProgress
                                                size={20}
                                                color="inherit"
                                            />
                                        ) : (
                                            "登録"
                                        )}
                                    </PrimaryButton>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}

// 共通フォームフィールドコンポーネント
const FormField = ({
    id,
    label,
    type = "text",
    placeholder,
    value,
    onChange,
    error,
}) => (
    <div>
        <InputLabel htmlFor={id} value={label} />
        <TextInput
            id={id}
            type={type}
            name={id}
            value={value}
            className="mt-1 block w-full"
            onChange={onChange}
            required
            placeholder={placeholder}
        />
        <InputError message={error} className="mt-2" />
    </div>
);

// パスワードフィールドコンポーネント
const PasswordField = ({
    id,
    label,
    value,
    onChange,
    error,
    isVisible,
    toggleVisibility,
}) => (
    <div>
        <InputLabel htmlFor={id} value={label} />
        <div className="relative">
            <TextInput
                id={id}
                type={isVisible ? "text" : "password"}
                name={id}
                value={value}
                className="mt-1 block w-full"
                autoComplete="new-password"
                onChange={onChange}
                required
                placeholder={label}
            />
            <div
                className="absolute inset-y-0 right-0 pr-3 flex items-center cursor-pointer"
                onClick={toggleVisibility}
                style={{ fontSize: 32, height: "100%" }}
            >
                {isVisible ? <VisibilityIcon /> : <VisibilityOffIcon />}
            </div>
        </div>
        <InputError message={error} className="mt-2" />
    </div>
);
