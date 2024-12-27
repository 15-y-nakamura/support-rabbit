import InputError from "@/Components/InputError";
import InputLabel from "@/Components/InputLabel";
import PrimaryButton from "@/Components/PrimaryButton";
import TextInput from "@/Components/TextInput";
import { Head, useForm, usePage } from "@inertiajs/react";
import { useEffect } from "react";

export default function ResetPassword({ token, email }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        token: token || "",
        email: email || "",
        password: "",
        password_confirmation: "",
    });

    const { props } = usePage();

    const submit = (e) => {
        e.preventDefault();

        post(route("password.update"), {
            onFinish: () => reset("password", "password_confirmation"),
        });
    };

    useEffect(() => {
        if (props.flash?.status) {
            const timer = setTimeout(() => {
                window.location.href = route("login");
            }, 3000);

            return () => clearTimeout(timer);
        }
    }, [props.flash?.status]);

    return (
        <div className="flex min-h-screen flex-col items-center bg-[#FFF6EA] pt-6 sm:justify-center sm:pt-0">
            <div className="text-center mb-4">
                <h1 className="text-xl sm:text-2xl font-bold text-gray-700">
                    パスワードリセット
                </h1>
            </div>
            <Head title="パスワードリセット" />
            <div className="w-full max-w-sm sm:max-w-md">
                <div className="bg-white shadow-md rounded-lg overflow-hidden p-4 sm:p-6">
                    {props.flash?.status && (
                        <div className="mb-4 text-sm font-medium text-green-600">
                            {props.flash.status}
                        </div>
                    )}

                    <form onSubmit={submit}>
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
                                autoComplete="username"
                                onChange={(e) =>
                                    setData("email", e.target.value)
                                }
                                required
                            />

                            <InputError
                                message={errors.email}
                                className="mt-2"
                            />
                        </div>

                        <div className="mt-4">
                            <InputLabel
                                htmlFor="password"
                                value="新しいパスワード"
                            />

                            <TextInput
                                id="password"
                                type="password"
                                name="password"
                                value={data.password}
                                className="mt-1 block w-full"
                                autoComplete="new-password"
                                isFocused={true}
                                onChange={(e) =>
                                    setData("password", e.target.value)
                                }
                                required
                            />

                            <InputError
                                message={errors.password}
                                className="mt-2"
                            />
                        </div>

                        <div className="mt-4">
                            <InputLabel
                                htmlFor="password_confirmation"
                                value="新しいパスワード（確認用）"
                            />

                            <TextInput
                                type="password"
                                id="password_confirmation"
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
                            />

                            <InputError
                                message={errors.password_confirmation}
                                className="mt-2"
                            />
                        </div>

                        <div className="mt-4 flex items-center justify-end">
                            <PrimaryButton
                                className="ms-4"
                                disabled={processing}
                            >
                                パスワードリセット
                            </PrimaryButton>
                        </div>
                    </form>
                </div>
            </div>

            {props.flash?.status && (
                <div className="fixed top-0 left-0 right-0 bg-green-500 text-white text-center py-4">
                    {props.flash.status}
                </div>
            )}
        </div>
    );
}
