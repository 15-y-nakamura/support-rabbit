import React from "react";
import { useForm, Head, Link } from "@inertiajs/react";
import InputLabel from "@/Components/InputLabel";
import TextInput from "@/Components/TextInput";
import InputError from "@/Components/InputError";
import PrimaryButton from "@/Components/PrimaryButton";

export default function Login({ status, canResetPassword }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        login_id: "",
        password: "",
        remember: false,
    });

    const submit = (e) => {
        e.preventDefault();
        post(route("login"), {
            onSuccess: (response) => {
                console.log("Login response:", response); // レスポンス全体をコンソールに出力して確認
                if (response.props.auth && response.props.auth.user) {
                    const token = response.props.auth.user.api_token;
                    console.log("Token obtained:", token); // トークンをコンソールに出力
                    localStorage.setItem("token", token);
                } else {
                    console.error("Token not found in response");
                }
                reset("password");
            },
        });
    };

    return (
        <div className="flex min-h-screen flex-col items-center bg-gray-100 pt-6 sm:justify-center sm:pt-0">
            <Head title="ログイン" />
            <div>
                <Link href="/">
                    <img
                        src="/path/to/logo.png" // 画像のパスを修正
                        alt="Application Logo"
                        className="h-20 w-20 fill-current text-gray-500"
                    />
                </Link>
            </div>

            <div className="mt-6 w-full overflow-hidden bg-white px-6 py-4 shadow-md sm:max-w-md sm:rounded-lg">
                {status && (
                    <div className="mb-4 text-sm font-medium text-green-600">
                        {status}
                    </div>
                )}

                <form onSubmit={submit}>
                    <div>
                        <InputLabel htmlFor="login_id" value="ユーザID" />

                        <TextInput
                            id="login_id"
                            type="text"
                            name="login_id"
                            value={data.login_id}
                            className="mt-1 block w-full"
                            autoComplete="username"
                            isFocused={true}
                            onChange={(e) =>
                                setData("login_id", e.target.value)
                            }
                        />

                        <InputError
                            message={errors.login_id}
                            className="mt-2"
                        />
                    </div>

                    <div className="mt-4">
                        <InputLabel htmlFor="password" value="パスワード" />

                        <TextInput
                            id="password"
                            type="password"
                            name="password"
                            value={data.password}
                            className="mt-1 block w-full"
                            autoComplete="current-password"
                            onChange={(e) =>
                                setData("password", e.target.value)
                            }
                        />

                        <InputError
                            message={errors.password}
                            className="mt-2"
                        />
                    </div>

                    <div className="mt-4 block">
                        <label className="flex items-center">
                            <input
                                type="checkbox"
                                name="remember"
                                checked={data.remember}
                                onChange={(e) =>
                                    setData("remember", e.target.checked)
                                }
                            />
                            <span className="ml-2 text-sm text-gray-600">
                                ログイン情報を保存
                            </span>
                        </label>
                    </div>

                    <div className="mt-4 flex items-center justify-end">
                        {canResetPassword && (
                            <Link
                                href={route("password.request")}
                                className="rounded-md text-sm text-gray-600 underline hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                            >
                                ユーザID・パスワードを忘れた方はこちら
                            </Link>
                        )}
                        <PrimaryButton className="ml-4" disabled={processing}>
                            ログイン
                        </PrimaryButton>
                    </div>
                </form>
            </div>
        </div>
    );
}
