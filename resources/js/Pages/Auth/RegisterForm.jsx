import React, { useState } from "react";
import { useForm, Link, Head } from "@inertiajs/react";
import InputLabel from "@/Components/InputLabel";
import TextInput from "@/Components/TextInput";
import InputError from "@/Components/InputError";
import PrimaryButton from "@/Components/PrimaryButton";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";

export default function RegisterForm() {
    const { data, setData, post, processing, errors, reset } = useForm({
        login_id: "",
        nickname: "",
        email: "",
        password: "",
        password_confirmation: "",
        birthday: "",
    });

    const [passwordType, setPasswordType] = useState("password");
    const [passwordConfirmationType, setPasswordConfirmationType] =
        useState("password");

    const togglePasswordVisibility = () => {
        setPasswordType((prevType) =>
            prevType === "password" ? "text" : "password"
        );
    };

    const togglePasswordConfirmationVisibility = () => {
        setPasswordConfirmationType((prevType) =>
            prevType === "password" ? "text" : "password"
        );
    };

    const submit = (e) => {
        e.preventDefault();
        post(route("register"), {
            onSuccess: (page) => {
                const token = page.props.auth.token;
                if (token) {
                    localStorage.setItem("authToken", token);
                }
                reset("password", "password_confirmation");
            },
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
                    初めまして
                </h1>
            </div>
            <Head title="新規登録" />
            <div className="w-full max-w-sm sm:max-w-4xl mx-auto">
                <div className="bg-white shadow-md rounded-lg overflow-hidden">
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
                    <div className="p-4 sm:p-6">
                        <form onSubmit={submit}>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <InputLabel
                                        htmlFor="login_id"
                                        value="ユーザID"
                                    />
                                    <TextInput
                                        id="login_id"
                                        name="login_id"
                                        value={data.login_id}
                                        className="mt-1 block w-full"
                                        autoComplete="login_id"
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
                                <div>
                                    <InputLabel
                                        htmlFor="nickname"
                                        value="ニックネーム"
                                    />
                                    <TextInput
                                        id="nickname"
                                        name="nickname"
                                        value={data.nickname}
                                        className="mt-1 block w-full"
                                        autoComplete="nickname"
                                        onChange={(e) =>
                                            setData("nickname", e.target.value)
                                        }
                                        required
                                        placeholder="ニックネーム"
                                    />
                                    <InputError
                                        message={errors.nickname}
                                        className="mt-2"
                                    />
                                </div>
                                <div>
                                    <InputLabel
                                        htmlFor="email"
                                        value="メールアドレス"
                                    />
                                    <TextInput
                                        id="email"
                                        type="email"
                                        name="email"
                                        value={data.email}
                                        className="mt-1 block w-full"
                                        autoComplete="email"
                                        onChange={(e) =>
                                            setData("email", e.target.value)
                                        }
                                        required
                                        placeholder="メールアドレス"
                                    />
                                    <InputError
                                        message={errors.email}
                                        className="mt-2"
                                    />
                                </div>
                                <div>
                                    <InputLabel
                                        htmlFor="birthday"
                                        value="生年月日"
                                    />
                                    <TextInput
                                        id="birthday"
                                        type="date"
                                        name="birthday"
                                        value={data.birthday}
                                        className="mt-1 block w-full"
                                        onChange={(e) =>
                                            setData("birthday", e.target.value)
                                        }
                                        placeholder="yyyy/mm/dd"
                                    />
                                    <InputError
                                        message={errors.birthday}
                                        className="mt-2"
                                    />
                                </div>
                                <div>
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
                                            autoComplete="new-password"
                                            onChange={(e) =>
                                                setData(
                                                    "password",
                                                    e.target.value
                                                )
                                            }
                                            required
                                            placeholder="パスワード"
                                        />
                                        {passwordType === "password" ? (
                                            <VisibilityOffIcon
                                                onClick={
                                                    togglePasswordVisibility
                                                }
                                                className="absolute inset-y-0 right-0 pr-3 flex items-center text-sm leading-5 cursor-pointer"
                                                style={{
                                                    fontSize: 32,
                                                    height: "100%",
                                                }}
                                            />
                                        ) : (
                                            <VisibilityIcon
                                                onClick={
                                                    togglePasswordVisibility
                                                }
                                                className="absolute inset-y-0 right-0 pr-3 flex items-center text-sm leading-5 cursor-pointer"
                                                style={{
                                                    fontSize: 32,
                                                    height: "100%",
                                                }}
                                            />
                                        )}
                                    </div>
                                    <InputError
                                        message={errors.password}
                                        className="mt-2"
                                    />
                                </div>
                                <div>
                                    <InputLabel
                                        htmlFor="password_confirmation"
                                        value="パスワード確認"
                                    />
                                    <div className="relative">
                                        <TextInput
                                            id="password_confirmation"
                                            type={passwordConfirmationType}
                                            name="password_confirmation"
                                            value={data.password_confirmation}
                                            className="mt-1 block w-full"
                                            autoComplete="new-password"
                                            onChange={(e) =>
                                                setData(
                                                    "password_confirmation",
                                                    e.target.value
                                                )
                                            }
                                            required
                                            placeholder="パスワード確認"
                                        />
                                        {passwordConfirmationType ===
                                        "password" ? (
                                            <VisibilityOffIcon
                                                onClick={
                                                    togglePasswordConfirmationVisibility
                                                }
                                                className="absolute inset-y-0 right-0 pr-3 flex items-center text-sm leading-5 cursor-pointer"
                                                style={{
                                                    fontSize: 32,
                                                    height: "100%",
                                                }}
                                            />
                                        ) : (
                                            <VisibilityIcon
                                                onClick={
                                                    togglePasswordConfirmationVisibility
                                                }
                                                className="absolute inset-y-0 right-0 pr-3 flex items-center text-sm leading-5 cursor-pointer"
                                                style={{
                                                    fontSize: 32,
                                                    height: "100%",
                                                }}
                                            />
                                        )}
                                    </div>
                                    <InputError
                                        message={errors.password_confirmation}
                                        className="mt-2"
                                    />
                                </div>
                            </div>
                            <div className="mt-4 flex items-center justify-between">
                                <Link
                                    href={route("login")}
                                    className="rounded-md text-sm text-gray-600 underline hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                                >
                                    既にアカウントをお持ちの方はこちら
                                </Link>
                                <PrimaryButton
                                    className="ml-4 bg-gray-700"
                                    disabled={processing}
                                >
                                    登録
                                </PrimaryButton>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}
