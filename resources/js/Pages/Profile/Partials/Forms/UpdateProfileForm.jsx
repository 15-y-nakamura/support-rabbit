import InputError from "@/Components/InputError";
import InputLabel from "@/Components/InputLabel";
import PrimaryButton from "@/Components/PrimaryButton";
import TextInput from "@/Components/TextInput";
import { Transition } from "@headlessui/react";
import { Link, useForm, usePage } from "@inertiajs/react";
import { useState } from "react";

export default function UpdateProfileForm({
    mustVerifyEmail,
    status,
    className = "",
}) {
    const user = usePage().props.auth.user;
    const [errorMessage, setErrorMessage] = useState("");

    const { data, setData, put, errors, processing, recentlySuccessful } =
        useForm({
            nickname: user.nickname,
            email: user.email,
            birthday: user.birthday.split("T")[0], // 生年月日を適切なフォーマットに変換
            login_id: user.login_id, // ログインIDを初期値として設定
        });

    const submit = (e) => {
        e.preventDefault();

        put(route("profile.update"), {
            onError: () => {
                setErrorMessage("保存に失敗しました。");
            },
        });
    };

    return (
        <section className={className}>
            <header>
                <h2 className="text-lg font-medium text-gray-900">
                    プロフィール情報
                </h2>

                <p className="mt-1 text-sm text-gray-600">
                    アカウントのプロフィール情報、メールアドレス、ユーザID、生年月日を更新します。
                </p>
            </header>

            <form onSubmit={submit} className="mt-6 space-y-6">
                <div>
                    <InputLabel htmlFor="login_id" value="ユーザID" />

                    <TextInput
                        id="login_id"
                        type="text"
                        className="mt-1 block w-full"
                        defaultValue={data.login_id} // valueからdefaultValueに変更
                        onChange={(e) => setData("login_id", e.target.value)}
                        required
                        placeholder="ユーザID"
                    />

                    <InputError className="mt-2" message={errors.login_id} />
                </div>

                <div>
                    <InputLabel htmlFor="nickname" value="ニックネーム" />

                    <TextInput
                        id="nickname"
                        className="mt-1 block w-full"
                        defaultValue={data.nickname} // valueからdefaultValueに変更
                        onChange={(e) => setData("nickname", e.target.value)}
                        required
                        isFocused
                        autoComplete="nickname"
                        placeholder="ニックネーム"
                    />

                    <InputError className="mt-2" message={errors.nickname} />
                </div>

                <div>
                    <InputLabel htmlFor="email" value="メールアドレス" />

                    <TextInput
                        id="email"
                        type="email"
                        className="mt-1 block w-full"
                        defaultValue={data.email} // valueからdefaultValueに変更
                        onChange={(e) => setData("email", e.target.value)}
                        required
                        autoComplete="username"
                        placeholder="メールアドレス"
                    />

                    <InputError className="mt-2" message={errors.email} />
                </div>

                <div>
                    <InputLabel htmlFor="birthday" value="生年月日" />

                    <TextInput
                        id="birthday"
                        type="date"
                        className="mt-1 block w-full"
                        defaultValue={data.birthday} // valueからdefaultValueに変更
                        onChange={(e) => setData("birthday", e.target.value)}
                        autoComplete="birthday"
                        placeholder="yyyy/mm/dd"
                    />

                    <InputError className="mt-2" message={errors.birthday} />
                </div>

                <div className="flex items-center gap-4">
                    <PrimaryButton
                        className="bg-gray-700"
                        disabled={processing}
                    >
                        保存
                    </PrimaryButton>

                    <Transition
                        show={recentlySuccessful || errorMessage}
                        enter="transition ease-in-out"
                        enterFrom="opacity-0"
                        leave="transition ease-in-out"
                        leaveTo="opacity-0"
                    >
                        <p
                            className={`text-sm ${
                                recentlySuccessful
                                    ? "text-gray-600"
                                    : "text-red-600"
                            }`}
                        >
                            {recentlySuccessful
                                ? "保存されました。"
                                : errorMessage}
                        </p>
                    </Transition>
                </div>
            </form>
        </section>
    );
}
