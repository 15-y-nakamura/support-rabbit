import React from "react";
import PrimaryButton from "@/Components/PrimaryButton";
import { Head, Link, useForm } from "@inertiajs/react";

export default function VerifyEmail({ status }) {
    const { post, processing } = useForm({});

    const submit = (e) => {
        e.preventDefault();
        post(route("verification.send"));
    };

    return (
        <div className="flex min-h-screen flex-col items-center bg-[#FFF6EA] pt-6 sm:justify-center sm:pt-0">
            <div className="flex justify-center mb-4">
                <img src="/img/logo.png" alt="Logo" className="h-24 sm:h-36" />
            </div>
            <div className="text-center mb-4">
                <h1 className="text-xl sm:text-2xl font-bold text-gray-700">
                    メールアドレス認証
                </h1>
            </div>
            <Head title="メールアドレス認証" />
            <div className="w-full max-w-sm sm:max-w-md">
                <div className="bg-white shadow-md rounded-lg overflow-hidden p-4 sm:p-6">
                    <div className="mb-4 text-sm text-gray-600">
                        登録ありがとうございます！
                        始める前に、登録時に入力したメールアドレスを確認するために、
                        送信されたリンクをクリックしてください。
                        もしメールが届いていない場合は、再度送信いたします。
                    </div>

                    {status === "verification-link-sent" && (
                        <div className="mb-4 text-sm font-medium text-green-600">
                            新しい確認リンクが登録時に提供された
                            メールアドレスに送信されました。
                        </div>
                    )}

                    <form onSubmit={submit}>
                        <div className="mt-4 flex items-center justify-between">
                            <PrimaryButton disabled={processing}>
                                確認メールを再送信
                            </PrimaryButton>

                            <Link
                                href={route("logout")}
                                method="post"
                                as="button"
                                className="rounded-md text-sm text-gray-600 underline hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                            >
                                ログアウト
                            </Link>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
