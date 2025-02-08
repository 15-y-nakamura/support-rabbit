import React, { useState } from "react";
import InputError from "@/Components/InputError";
import PrimaryButton from "@/Components/PrimaryButton";
import TextInput from "@/Components/TextInput";
import { Head, useForm, Link } from "@inertiajs/react";
import CircularProgress from "@mui/material/CircularProgress";

export default function ForgotPasswordForm() {
    const { data, setData, post, processing, errors, reset } = useForm({
        email: "",
    });

    const [successMessage, setSuccessMessage] = useState("");

    const submit = (e) => {
        e.preventDefault();
        post(route("password.email"), {
            onSuccess: () => {
                setSuccessMessage("メールアドレスが送信されました");
                reset("email");
            },
            onError: () => {
                setSuccessMessage("");
            },
        });
    };

    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-[#FFF6EA] pt-6 sm:pt-0">
            <div className="text-center mb-6">
                <h1 className="text-xl sm:text-2xl font-bold text-gray-700">
                    パスワードリセット
                </h1>
            </div>
            <Head title="ユーザID・パスワード再発行" />

            <div className="w-full max-w-sm sm:max-w-lg">
                <div className="bg-white shadow-md rounded-lg overflow-hidden p-4 sm:p-6">
                    <p className="mb-4 text-base sm:text-lg text-gray-600">
                        登録済みのメールアドレスを入力してください。
                        <br />
                        ユーザIDとパスワードリセット用のリンクを送信します。
                    </p>

                    <form onSubmit={submit}>
                        <div className="mt-3">
                            <TextInput
                                id="email"
                                type="email"
                                name="email"
                                value={data.email}
                                className="mt-1 block w-full text-base sm:text-lg"
                                autoFocus
                                placeholder="例: example@email.com"
                                onChange={(e) =>
                                    setData("email", e.target.value)
                                }
                            />
                            <InputError
                                message={errors.email}
                                className="mt-2 text-base sm:text-lg"
                            />
                        </div>

                        {successMessage && (
                            <div className="mt-2 text-base sm:text-lg text-green-600">
                                {successMessage}
                            </div>
                        )}

                        <div className="mt-4 flex items-center justify-between">
                            <Link
                                href="/login"
                                className="rounded-md text-base sm:text-lg text-gray-600 underline hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                            >
                                戻る
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
                                    "送信"
                                )}
                            </PrimaryButton>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
