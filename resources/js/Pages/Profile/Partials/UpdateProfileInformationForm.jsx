import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import { Transition } from '@headlessui/react';
import { Link, useForm, usePage } from '@inertiajs/react';

export default function UpdateProfileInformation({
    mustVerifyEmail,
    status,
    className = '',
}) {
    const user = usePage().props.auth.user;

    const { data, setData, patch, errors, processing, recentlySuccessful } =
        useForm({
            nickname: user.nickname,
            email: user.email,
            birthday: user.birthday,
            login_id: user.login_id, // ログインIDを初期値として設定
        });

    const submit = (e) => {
        e.preventDefault();

        patch(route('profile.update'));
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
                        value={data.login_id}
                        onChange={(e) => setData('login_id', e.target.value)}
                        required
                    />

                    <InputError className="mt-2" message={errors.login_id} />
                </div>

                <div>
                <InputLabel htmlFor="nickname" value="ニックネーム" />

                    <TextInput
                        id="nickname"
                        className="mt-1 block w-full"
                        value={data.nickname}
                        onChange={(e) => setData('nickname', e.target.value)}
                        required
                        isFocused
                        autoComplete="nickname"
                    />

                    <InputError className="mt-2" message={errors.nickname} />
                </div>

                <div>
                    <InputLabel htmlFor="email" value="メールアドレス" />

                    <TextInput
                        id="email"
                        type="email"
                        className="mt-1 block w-full"
                        value={data.email}
                        onChange={(e) => setData('email', e.target.value)}
                        required
                        autoComplete="username"
                    />

                    <InputError className="mt-2" message={errors.email} />
                </div>

                <div>
                    <InputLabel htmlFor="birthday" value="生年月日" />

                    <TextInput
                        id="birthday"
                        type="date"
                        className="mt-1 block w-full"
                        value={data.birthday}
                        onChange={(e) => setData('birthday', e.target.value)}
                        autoComplete="birthday"
                    />

                    <InputError className="mt-2" message={errors.birthday} />
                </div>

                {mustVerifyEmail && user.email_verified_at === null && (
                    <div>
                        <p className="mt-2 text-sm text-gray-800">
                            メールアドレスが確認されていません。
                            <Link
                                href={route('verification.send')}
                                method="post"
                                as="button"
                                className="rounded-md text-sm text-gray-600 underline hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                            >
                                メールの再送信はこちらをクリック
                            </Link>
                        </p>

                        {status === 'verification-link-sent' && (
                            <div className="mt-2 text-sm font-medium text-green-600">
                                新しい確認リンクがメールアドレスに送信されました。
                            </div>
                        )}
                    </div>
                )}

                <div className="flex items-center gap-4">
                    <PrimaryButton disabled={processing}>保存</PrimaryButton>

                    <Transition
                        show={recentlySuccessful}
                        enter="transition ease-in-out"
                        enterFrom="opacity-0"
                        leave="transition ease-in-out"
                        leaveTo="opacity-0"
                    >
                        <p className="text-sm text-gray-600">
                            保存されました。
                        </p>
                    </Transition>
                </div>
            </form>
        </section>
    );
}
