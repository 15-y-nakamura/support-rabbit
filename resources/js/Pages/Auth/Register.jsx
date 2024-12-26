import InputError from "@/Components/InputError";
import InputLabel from "@/Components/InputLabel";
import PrimaryButton from "@/Components/PrimaryButton";
import TextInput from "@/Components/TextInput";
import { Head, Link, useForm } from "@inertiajs/react";

export default function Register() {
    const { data, setData, post, processing, errors, reset } = useForm({
        nickname: "",
        login_id: "",
        email: "",
        password: "",
        password_confirmation: "",
        birthday: "",
    });

    const submit = (e) => {
        e.preventDefault();

        post(route("register"), {
            onFinish: () => reset("password", "password_confirmation"),
        });
    };

    return (
        <div className="flex min-h-screen flex-col items-center bg-gray-100 pt-6 sm:justify-center sm:pt-0">
            <Head title="新規登録" />

            <div>
                <h1 className="text-2xl font-bold">新規登録</h1>
            </div>

            <div className="mt-6 w-full overflow-hidden bg-white px-6 py-4 shadow-md sm:max-w-md sm:rounded-lg">
                <form onSubmit={submit}>
                    <div>
                        <InputLabel htmlFor="nickname" value="ニックネーム" />

                        <TextInput
                            id="nickname"
                            name="nickname"
                            value={data.nickname}
                            className="mt-1 block w-full"
                            autoComplete="nickname"
                            isFocused={true}
                            onChange={(e) =>
                                setData("nickname", e.target.value)
                            }
                            required
                        />

                        <InputError
                            message={errors.nickname}
                            className="mt-2"
                        />
                    </div>

                    <div className="mt-4">
                        <InputLabel htmlFor="login_id" value="ユーザID" />

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
                        />

                        <InputError
                            message={errors.login_id}
                            className="mt-2"
                        />
                    </div>

                    <div className="mt-4">
                        <InputLabel htmlFor="email" value="メールアドレス" />

                        <TextInput
                            id="email"
                            type="email"
                            name="email"
                            value={data.email}
                            className="mt-1 block w-full"
                            autoComplete="username"
                            onChange={(e) => setData("email", e.target.value)}
                            required
                        />

                        <InputError message={errors.email} className="mt-2" />
                    </div>

                    <div className="mt-4">
                        <InputLabel htmlFor="password" value="パスワード" />

                        <TextInput
                            id="password"
                            type="password"
                            name="password"
                            value={data.password}
                            className="mt-1 block w-full"
                            autoComplete="new-password"
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
                            value="パスワード確認"
                        />

                        <TextInput
                            id="password_confirmation"
                            type="password"
                            name="password_confirmation"
                            value={data.password_confirmation}
                            className="mt-1 block w-full"
                            autoComplete="new-password"
                            onChange={(e) =>
                                setData("password_confirmation", e.target.value)
                            }
                            required
                        />

                        <InputError
                            message={errors.password_confirmation}
                            className="mt-2"
                        />
                    </div>

                    <div className="mt-4">
                        <InputLabel htmlFor="birthday" value="生年月日" />

                        <TextInput
                            id="birthday"
                            type="date"
                            name="birthday"
                            value={data.birthday}
                            className="mt-1 block w-full"
                            onChange={(e) =>
                                setData("birthday", e.target.value)
                            }
                        />

                        <InputError
                            message={errors.birthday}
                            className="mt-2"
                        />
                    </div>

                    <div className="mt-4 flex items-center justify-end">
                        <Link
                            href={route("login")}
                            className="rounded-md text-sm text-gray-600 underline hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                        >
                            すでにアカウントをお持ちですか？
                        </Link>

                        <PrimaryButton className="ms-4" disabled={processing}>
                            登録
                        </PrimaryButton>
                    </div>
                </form>
            </div>
        </div>
    );
}
