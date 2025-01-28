import React, { useState } from "react";
import InputError from "@/Components/InputError";
import PrimaryButton from "@/Components/PrimaryButton";
import TextInput from "@/Components/TextInput";
import { Head, useForm, Link } from "@inertiajs/react";

export default function ForgotPassword() {
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
        });
    };

    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-[#FFF6EA] pt-6 sm:pt-0">
            <div className="text-center mb-8">
                <h1 className="text-2xl sm:text-4xl font-bold text-gray-700">
                    パスワードリセット
                </h1>
            </div>
            <Head title="ユーザID・パスワード再発行" />
            <div className="w-full max-w-sm sm:max-w-lg">
                <div className="bg-white shadow-md rounded-lg overflow-hidden p-6 sm:p-10">
                    <div className="mb-6 text-lg sm:text-xl text-gray-600">
                        登録いただいたメールアドレスを入力していただければ、
                        ユーザIDとパスワードリセット用のリンクを送信いたします。
                    </div>

                    <form onSubmit={submit}>
                        <TextInput
                            id="email"
                            type="email"
                            name="email"
                            value={data.email}
                            className="mt-1 block w-full text-lg sm:text-xl"
                            isFocused={true}
                            onChange={(e) => {
                                setData("email", e.target.value);
                                setSuccessMessage(""); // フィールド変更時に成功メッセージをクリア
                            }}
                        />

                        {errors.email ? (
                            <InputError
                                message={errors.email}
                                className="mt-2 text-lg sm:text-xl"
                            />
                        ) : (
                            successMessage && (
                                <div className="mt-2 text-lg sm:text-xl text-green-600">
                                    {successMessage}
                                </div>
                            )
                        )}

                        <div className="mt-6 flex items-center justify-between">
                            <Link
                                href="/login"
                                className="rounded-md text-lg sm:text-xl text-gray-600 underline hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                            >
                                戻る
                            </Link>
                            <PrimaryButton
                                className="ms-4 text-lg sm:text-xl"
                                disabled={processing}
                            >
                                送信
                            </PrimaryButton>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
