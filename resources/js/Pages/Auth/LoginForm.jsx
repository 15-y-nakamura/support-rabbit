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
    const { data, setData, post, processing, errors, reset } = useForm({
        login_id: "",
        password: "",
    });

    const [passwordType, setPasswordType] = useState("password");

    const togglePasswordVisibility = () => {
        setPasswordType((prevType) =>
            prevType === "password" ? "text" : "password"
        );
    };

    const submit = (e) => {
        e.preventDefault();
        post(route("login"), {
            onSuccess: () => reset("password"),
            onError: () => {},
        });
    };

    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-[#FFF6EA] pt-6 sm:pt-0">
            <div className="flex justify-center mb-4">
                <img
                    src="/img/logos/logo.png"
                    alt="Logo"
                    className="h-24 sm:h-36"
                    style={{ width: "125px", height: "125px" }}
                />
            </div>
            <div className="text-center mb-4">
                <h1 className="text-xl sm:text-2xl font-semibold text-gray-700">
                    こんにちは
                </h1>
            </div>
            <Head title="ログイン" />
            <div className="w-full max-w-sm sm:max-w-md mx-auto">
                <div className="bg-white shadow-md rounded-lg overflow-hidden">
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
                    <div className="p-4 sm:p-6">
                        <form onSubmit={submit}>
                            <div className="mt-2">
                                <InputLabel
                                    htmlFor="login_id"
                                    value="ユーザID"
                                />
                                <TextInput
                                    id="login_id"
                                    name="login_id"
                                    value={data.login_id}
                                    className="mt-1 block w-full"
                                    autoComplete="username"
                                    onChange={(e) =>
                                        setData("login_id", e.target.value)
                                    }
                                    required
                                    placeholder="ユーザID"
                                />
                                <InputError
                                    message={errors.login_id}
                                    className="mt-2"
                                />
                            </div>

                            <div className="mt-4">
                                <InputLabel
                                    htmlFor="password"
                                    value="パスワード"
                                />
                                <div className="relative">
                                    <TextInput
                                        id="password"
                                        type={passwordType}
                                        name="password"
                                        value={data.password}
                                        className="mt-1 block w-full"
                                        autoComplete="current-password"
                                        onChange={(e) =>
                                            setData("password", e.target.value)
                                        }
                                        required
                                        placeholder="パスワード"
                                    />
                                    <div
                                        className="absolute inset-y-0 right-0 pr-3 flex items-center cursor-pointer"
                                        onClick={togglePasswordVisibility}
                                        style={{
                                            width: "32px",
                                            height: "100%",
                                        }}
                                    >
                                        {passwordType === "password" ? (
                                            <VisibilityOffIcon
                                                style={{ fontSize: 24 }}
                                            />
                                        ) : (
                                            <VisibilityIcon
                                                style={{ fontSize: 24 }}
                                            />
                                        )}
                                    </div>
                                </div>
                                <InputError
                                    message={errors.password}
                                    className="mt-2"
                                />
                            </div>

                            {/* 認証エラーを個別に表示 */}
                            {errors.login && (
                                <div className="text-red-500 text-sm mt-2">
                                    {errors.login}
                                </div>
                            )}

                            <div className="mt-4 flex items-center justify-between">
                                <Link
                                    href={route("password.request")}
                                    className="rounded-md text-sm text-gray-600 underline hover:text-gray-900"
                                >
                                    ユーザID・パスワードを忘れた方はこちら
                                </Link>

                                <PrimaryButton
                                    className="ml-4 bg-gray-700"
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
