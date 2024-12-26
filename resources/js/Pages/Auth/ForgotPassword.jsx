import React from "react";
import InputError from "@/Components/InputError";
import PrimaryButton from "@/Components/PrimaryButton";
import TextInput from "@/Components/TextInput";
import { Head, useForm, usePage } from "@inertiajs/react";

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
        <div className="flex min-h-screen flex-col items-center bg-gray-100 pt-6 sm:justify-center sm:pt-0">
            <Head title="ユーザID・パスワード再発行" />
            <div>
                <h1 className="text-2xl font-bold">パスワードリセット</h1>
            </div>

            <div className="mt-6 w-full overflow-hidden bg-white px-6 py-4 shadow-md sm:max-w-md sm:rounded-lg">
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

                    <div className="mt-4 flex items-center justify-end">
                        <PrimaryButton className="ms-4" disabled={processing}>
                            送信
                        </PrimaryButton>
                    </div>
                </form>
            </div>
        </div>
    );
}
