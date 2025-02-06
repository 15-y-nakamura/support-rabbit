import React, { useState } from "react";
import { useForm, Link, Head } from "@inertiajs/react";
import InputLabel from "@/Components/InputLabel";
import TextInput from "@/Components/TextInput";
import InputError from "@/Components/InputError";
import PrimaryButton from "@/Components/PrimaryButton";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import CircularProgress from "@mui/material/CircularProgress";

export default function LoginForm() {
    const { data, setData, errors, setError, post, processing } = useForm({
        login_id: "",
        password: "",
    });

    const [showPassword, setShowPassword] = useState(false);

    // パスワードの可視化トグル
    const togglePasswordVisibility = () => {
        setShowPassword((prev) => !prev);
    };

    const submit = async (e) => {
        e.preventDefault();
        post(route("login"), {
            onSuccess: (response) => {
                localStorage.setItem("authToken", response.data.token);
                window.location.href = "/user/calendar";
            },
            onError: (error) => {
                if (error.response && error.response.data.errors) {
                    Object.keys(error.response.data.errors).forEach((field) => {
                        setError(field, error.response.data.errors[field]);
                    });
                }
            },
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
                    こんにちは
                </h1>
            </div>
            <Head title="ログイン" />

            <div className="w-full max-w-sm sm:max-w-md mx-auto">
                <div className="bg-white shadow-md rounded-lg overflow-hidden">
                    {/* タブ切り替え */}
                    <div className="flex justify-center">
                        <button className="w-1/2 py-2 sm:py-4 text-gray-700 font-medium bg-customPink">
                            ログイン
                        </button>
                        <Link
                            href={route("register")}
                            className="w-1/2 py-2 sm:py-4 text-gray-700 font-medium bg-[#FFB6C1] text-center"
                        >
                            新規登録
                        </Link>
                    </div>

                    {/* フォーム */}
                    <div className="p-4 sm:p-6">
                        <form onSubmit={submit}>
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
                                toggleVisibility={togglePasswordVisibility}
                            />

                            {/* ログインエラー表示 */}
                            <InputError
                                message={errors.login}
                                className="mt-2"
                            />

                            {/* ボタン & リンク */}
                            <div className="mt-4 flex items-center justify-between">
                                <Link
                                    href={route("password.request")}
                                    className="rounded-md text-sm text-gray-600 underline hover:text-gray-900"
                                >
                                    ユーザID・パスワードを忘れた方はこちら
                                </Link>

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
                                        "ログイン"
                                    )}
                                </PrimaryButton>
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
    <div className="mt-4">
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
    <div className="mt-4">
        <InputLabel htmlFor={id} value={label} />
        <div className="relative">
            <TextInput
                id={id}
                type={isVisible ? "text" : "password"}
                name={id}
                value={value}
                className="mt-1 block w-full"
                autoComplete="current-password"
                onChange={onChange}
                required
                placeholder={label}
            />
            <div
                className="absolute inset-y-0 right-0 pr-3 flex items-center cursor-pointer"
                onClick={toggleVisibility}
                style={{ fontSize: 24, height: "100%" }}
            >
                {isVisible ? <VisibilityIcon /> : <VisibilityOffIcon />}
            </div>
        </div>
        <InputError message={error} className="mt-2" />
    </div>
);
