import React, { useState } from "react";
import { useForm, Link } from "@inertiajs/react";
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

    const submit = (e) => {
        e.preventDefault();
        post(route("register"), {
            onSuccess: () => reset("password", "password_confirmation"),
        });
    };

    return (
        <form onSubmit={submit}>
            <div className="mt-4">
                <InputLabel htmlFor="login_id" value="ユーザID" />
                <TextInput
                    id="login_id"
                    name="login_id"
                    value={data.login_id}
                    className="mt-1 block w-full"
                    autoComplete="login_id"
                    onChange={(e) => setData("login_id", e.target.value)}
                    required
                    placeholder="ユーザID（1〜15文字）"
                />
                <InputError message={errors.login_id} className="mt-2" />
            </div>
            <div className="mt-4">
                <InputLabel htmlFor="nickname" value="ニックネーム" />
                <TextInput
                    id="nickname"
                    name="nickname"
                    value={data.nickname}
                    className="mt-1 block w-full"
                    autoComplete="nickname"
                    onChange={(e) => setData("nickname", e.target.value)}
                    required
                    placeholder="ニックネーム（1〜15文字）"
                />
                <InputError message={errors.nickname} className="mt-2" />
            </div>
            <div className="mt-4">
                <InputLabel htmlFor="email" value="メールアドレス" />
                <TextInput
                    id="email"
                    type="email"
                    name="email"
                    value={data.email}
                    className="mt-1 block w-full"
                    autoComplete="email"
                    onChange={(e) => setData("email", e.target.value)}
                    required
                    placeholder="メールアドレス"
                />
                <InputError message={errors.email} className="mt-2" />
            </div>
            <div className="mt-4">
                <InputLabel htmlFor="birthday" value="生年月日" />
                <TextInput
                    id="birthday"
                    type="date"
                    name="birthday"
                    value={data.birthday}
                    className="mt-1 block w-full"
                    onChange={(e) => setData("birthday", e.target.value)}
                    placeholder="yyyy/mm/dd"
                />
                <InputError message={errors.birthday} className="mt-2" />
            </div>
            <div className="mt-4">
                <InputLabel htmlFor="password" value="パスワード" />
                <div className="relative">
                    <TextInput
                        id="password"
                        type={passwordType}
                        name="password"
                        value={data.password}
                        className="mt-1 block w-full"
                        autoComplete="new-password"
                        onChange={(e) => setData("password", e.target.value)}
                        required
                        placeholder="パスワード（8〜12文字）"
                    />
                    {passwordType === "password" ? (
                        <VisibilityOffIcon
                            onClick={() => setPasswordType("text")}
                            className="absolute inset-y-0 right-0 pr-3 flex items-center text-sm leading-5 cursor-pointer"
                            style={{ fontSize: 32, height: "100%" }}
                        />
                    ) : (
                        <VisibilityIcon
                            onClick={() => setPasswordType("password")}
                            className="absolute inset-y-0 right-0 pr-3 flex items-center text-sm leading-5 cursor-pointer"
                            style={{ fontSize: 32, height: "100%" }}
                        />
                    )}
                </div>
                <InputError message={errors.password} className="mt-2" />
            </div>
            <div className="mt-4">
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
                            setData("password_confirmation", e.target.value)
                        }
                        required
                        placeholder="パスワード確認"
                    />
                    {passwordConfirmationType === "password" ? (
                        <VisibilityOffIcon
                            onClick={() => setPasswordConfirmationType("text")}
                            className="absolute inset-y-0 right-0 pr-3 flex items-center text-sm leading-5 cursor-pointer"
                            style={{ fontSize: 32, height: "100%" }}
                        />
                    ) : (
                        <VisibilityIcon
                            onClick={() =>
                                setPasswordConfirmationType("password")
                            }
                            className="absolute inset-y-0 right-0 pr-3 flex items-center text-sm leading-5 cursor-pointer"
                            style={{ fontSize: 32, height: "100%" }}
                        />
                    )}
                </div>
                <InputError
                    message={errors.password_confirmation}
                    className="mt-2"
                />
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
    );
}
