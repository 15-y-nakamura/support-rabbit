import React from "react";
import InputError from "@/Components/InputError";
import PrimaryButton from "@/Components/PrimaryButton";
import TextInput from "@/Components/TextInput";
import { Head, useForm, usePage, Link } from "@inertiajs/react";

export default function ForgotPassword() {
    const { data, setData, post, processing, errors } = useForm({
        email: "",
    });

    const { props } = usePage();

    const submit = (e) => {
        e.preventDefault();
        post(route("password.email"));
    };

    return (
        <div className="flex min-h-screen flex-col items-center bg-[#FFF6EA] pt-6 sm:justify-center sm:pt-0">
            <div className="text-center mb-4">
                <h1 className="text-xl sm:text-2xl font-bold text-gray-700">
                    パスワードリセット
                </h1>
            </div>
            <Head title="ユーザID・パスワード再発行" />
            <div className="w-full max-w-sm sm:max-w-md">
                <div className="bg-white shadow-md rounded-lg overflow-hidden p-4 sm:p-6">
                    <div className="mb-4 text-sm text-gray-600">
                        登録いただいたメールアドレスを入力していただければ、
                        ユーザIDとパスワードリセット用のリンクを送信いたします。
                    </div>

                    {props.flash?.status && (
                        <div className="mb-4 text-sm font-medium text-green-600">
                            {props.flash.status}
                        </div>
                    )}

                    <form onSubmit={submit}>
                        <TextInput
                            id="email"
                            type="email"
                            name="email"
                            value={data.email}
                            className="mt-1 block w-full"
                            isFocused={true}
                            onChange={(e) => setData("email", e.target.value)}
                        />

                        <InputError message={errors.email} className="mt-2" />

                        <div className="mt-4 flex items-center justify-between">
                            <Link
                                href={route("auth.toggle")}
                                className="rounded-md text-sm text-gray-600 underline hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                            >
                                戻る
                            </Link>
                            <PrimaryButton
                                className="ms-4"
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
