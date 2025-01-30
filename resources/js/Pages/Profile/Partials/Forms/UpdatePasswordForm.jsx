import InputError from "@/Components/InputError";
import InputLabel from "@/Components/InputLabel";
import PrimaryButton from "@/Components/PrimaryButton";
import TextInput from "@/Components/TextInput";
import { Transition } from "@headlessui/react";
import { useForm } from "@inertiajs/react";
import { useRef, useState } from "react";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";

export default function UpdatePasswordForm({ className = "" }) {
    const passwordInput = useRef();
    const currentPasswordInput = useRef();

    const {
        data,
        setData,
        errors,
        put,
        reset,
        processing,
        recentlySuccessful,
    } = useForm({
        current_password: "",
        password: "",
        password_confirmation: "",
    });

    const [currentPasswordType, setCurrentPasswordType] = useState("password");
    const [newPasswordType, setNewPasswordType] = useState("password");
    const [passwordConfirmationType, setPasswordConfirmationType] =
        useState("password");
    const [errorMessage, setErrorMessage] = useState("");

    const updatePassword = (e) => {
        e.preventDefault();

        put(route("profile.password"), {
            preserveScroll: true,
            onSuccess: () => {
                reset();
                setErrorMessage("");
            },
            onError: (errors) => {
                setErrorMessage("保存に失敗しました。");
                if (errors.password) {
                    reset("password", "password_confirmation");
                    passwordInput.current.focus();
                }

                if (errors.current_password) {
                    reset("current_password");
                    currentPasswordInput.current.focus();
                }
            },
        });
    };

    return (
        <section className={className}>
            <header>
                <h2 className="text-lg font-medium text-gray-900">
                    パスワードの更新
                </h2>

                <p className="mt-1 text-sm text-gray-600">
                    アカウントを安全に保つために、長くランダムなパスワードを使用してください。
                </p>
            </header>

            <form onSubmit={updatePassword} className="mt-6 space-y-6">
                <div>
                    <InputLabel
                        htmlFor="current_password_update"
                        value="現在のパスワード"
                    />
                    <div className="relative">
                        <TextInput
                            id="current_password_update"
                            ref={currentPasswordInput}
                            value={data.current_password}
                            onChange={(e) =>
                                setData("current_password", e.target.value)
                            }
                            type={currentPasswordType}
                            className="mt-1 block w-full"
                            autoComplete="current-password"
                            placeholder="現在のパスワード"
                        />
                        {currentPasswordType === "password" ? (
                            <VisibilityOffIcon
                                onClick={() => setCurrentPasswordType("text")}
                                className="absolute inset-y-0 right-0 pr-3 flex items-center text-sm leading-5 cursor-pointer"
                                style={{ fontSize: 32, height: "100%" }}
                            />
                        ) : (
                            <VisibilityIcon
                                onClick={() =>
                                    setCurrentPasswordType("password")
                                }
                                className="absolute inset-y-0 right-0 pr-3 flex items-center text-sm leading-5 cursor-pointer"
                                style={{ fontSize: 32, height: "100%" }}
                            />
                        )}
                    </div>
                    <InputError
                        message={errors.current_password}
                        className="mt-2"
                    />
                </div>

                <div>
                    <InputLabel
                        htmlFor="new_password"
                        value="新しいパスワード"
                    />
                    <div className="relative">
                        <TextInput
                            id="new_password"
                            ref={passwordInput}
                            value={data.password}
                            onChange={(e) =>
                                setData("password", e.target.value)
                            }
                            type={newPasswordType}
                            className="mt-1 block w-full"
                            autoComplete="new-password"
                            placeholder="新しいパスワード"
                        />
                        {newPasswordType === "password" ? (
                            <VisibilityOffIcon
                                onClick={() => setNewPasswordType("text")}
                                className="absolute inset-y-0 right-0 pr-3 flex items-center text-sm leading-5 cursor-pointer"
                                style={{ fontSize: 32, height: "100%" }}
                            />
                        ) : (
                            <VisibilityIcon
                                onClick={() => setNewPasswordType("password")}
                                className="absolute inset-y-0 right-0 pr-3 flex items-center text-sm leading-5 cursor-pointer"
                                style={{ fontSize: 32, height: "100%" }}
                            />
                        )}
                    </div>
                    <InputError message={errors.password} className="mt-2" />
                </div>

                <div>
                    <InputLabel
                        htmlFor="password_confirmation_update"
                        value="パスワードの確認"
                    />
                    <div className="relative">
                        <TextInput
                            id="password_confirmation_update"
                            value={data.password_confirmation}
                            onChange={(e) =>
                                setData("password_confirmation", e.target.value)
                            }
                            type={passwordConfirmationType}
                            className="mt-1 block w-full"
                            autoComplete="new-password"
                            placeholder="パスワードの確認"
                        />
                        {passwordConfirmationType === "password" ? (
                            <VisibilityOffIcon
                                onClick={() =>
                                    setPasswordConfirmationType("text")
                                }
                                className="absolute inset-y-0 right-0 pr-3 flex items-center text-sm leading-5 cursor-pointer"
                                style={{ fontSize: 32, height: "100%" }}
                            />
                        ) : (
                            <VisibilityIcon
                                onClick={() =>
                                    setPasswordConfirmationType("password")
                                }
                                className="absolute inset-y-0 right-0 pr-3 flex items-center text-sm leading-5 cursor-pointer"
                                style={{ fontSize: 32, height: "100%" }}
                            />
                        )}
                    </div>
                    <InputError
                        message={errors.password_confirmation}
                        className="mt-2"
                    />
                </div>

                <div className="flex items-center gap-4">
                    <PrimaryButton disabled={processing}>保存</PrimaryButton>

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
