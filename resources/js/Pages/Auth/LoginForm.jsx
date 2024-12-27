import React, { useState } from "react";
import { useForm, Link } from "@inertiajs/react";
import InputLabel from "@/Components/InputLabel";
import TextInput from "@/Components/TextInput";
import InputError from "@/Components/InputError";
import PrimaryButton from "@/Components/PrimaryButton";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";

export default function LoginForm() {
    const { data, setData, post, processing, errors, reset } = useForm({
        login_id: "",
        password: "",
    });

    const [passwordType, setPasswordType] = useState("password");

    const submit = (e) => {
        e.preventDefault();
        post(route("login"), {
            onSuccess: () => reset("password"),
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
                    autoComplete="username"
                    onChange={(e) => setData("login_id", e.target.value)}
                    required
                    placeholder="ユーザID（1〜15文字）"
                />
                <InputError message={errors.login_id} className="mt-2" />
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
                        autoComplete="current-password"
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
            <div className="mt-4 flex items-center justify-between">
                <Link
                    href={route("password.request")}
                    className="rounded-md text-sm text-gray-600 underline hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                >
                    ユーザID・パスワードを忘れた方はこちら
                </Link>
                <PrimaryButton
                    className="ml-4 bg-gray-700"
                    disabled={processing}
                >
                    ログイン
                </PrimaryButton>
            </div>
        </form>
    );
}
