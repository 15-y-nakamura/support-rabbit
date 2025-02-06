import InputError from "@/Components/InputError";
import InputLabel from "@/Components/InputLabel";
import PrimaryButton from "@/Components/PrimaryButton";
import TextInput from "@/Components/TextInput";
import { Head, useForm, usePage } from "@inertiajs/react";
import { useEffect, useState } from "react";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";

export default function ResetPasswordForm({ token, email }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        token: token || "",
        email: email || "",
        password: "",
        password_confirmation: "",
    });

    const { props } = usePage();
    const [successMessage, setSuccessMessage] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [showPasswordConfirm, setShowPasswordConfirm] = useState(false);

    // パスワード可視化トグル
    const toggleVisibility = (field) => {
        if (field === "password") setShowPassword((prev) => !prev);
        if (field === "password_confirmation")
            setShowPasswordConfirm((prev) => !prev);
    };

    const submit = (e) => {
        e.preventDefault();

        // メッセージをクリア
        setSuccessMessage("");
        reset("errors");

        post(route("password.update"), {
            onSuccess: () => {
                setSuccessMessage("パスワードが変更されました");
                reset("password", "password_confirmation");

                setTimeout(() => {
                    window.location.href = route("login");
                }, 3000);
            },
            onError: (errors) => {
                console.error(errors);
            },
        });
    };

    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-[#FFF6EA] pt-6 sm:pt-0">
            <div className="text-center mb-8">
                <h1 className="text-xl sm:text-2xl font-bold text-gray-700">
                    パスワードリセット
                </h1>
            </div>
            <Head title="パスワードリセット" />
            <div className="w-full max-w-xs sm:max-w-md">
                <div className="bg-white shadow-md rounded-lg overflow-hidden p-4 sm:p-6">
                    <form onSubmit={submit}>
                        {/* 新しいパスワード */}
                        <PasswordField
                            id="password"
                            label="新しいパスワード"
                            value={data.password}
                            onChange={(e) =>
                                setData("password", e.target.value)
                            }
                            error={errors.password}
                            isVisible={showPassword}
                            toggleVisibility={() =>
                                toggleVisibility("password")
                            }
                            autoFocus
                        />

                        {/* 新しいパスワード（確認用） */}
                        <PasswordField
                            id="password_confirmation"
                            label="新しいパスワード（確認用）"
                            value={data.password_confirmation}
                            onChange={(e) =>
                                setData("password_confirmation", e.target.value)
                            }
                            error={errors.password_confirmation}
                            isVisible={showPasswordConfirm}
                            toggleVisibility={() =>
                                toggleVisibility("password_confirmation")
                            }
                        />

                        {/* エラーメッセージ */}
                        <InputError
                            message={errors.token}
                            className="mt-2 text-base sm:text-lg"
                        />

                        {/* 成功メッセージ */}
                        {successMessage && (
                            <div className="mt-2 text-base sm:text-lg text-green-600">
                                {successMessage}
                            </div>
                        )}

                        {/* 送信ボタン */}
                        <div className="mt-6 flex items-center justify-end">
                            <PrimaryButton
                                className="ms-4 text-base sm:text-lg"
                                disabled={processing}
                            >
                                パスワードリセット
                            </PrimaryButton>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}

// パスワードフィールドコンポーネント
const PasswordField = ({
    id,
    label,
    value,
    onChange,
    error,
    isVisible,
    toggleVisibility,
    autoFocus,
}) => (
    <div className="mt-4">
        <InputLabel htmlFor={id} value={label} />
        <div className="relative">
            <TextInput
                id={id}
                type={isVisible ? "text" : "password"}
                name={id}
                value={value}
                className="mt-1 block w-full text-base sm:text-lg"
                autoComplete="new-password"
                onChange={onChange}
                required
                placeholder={label}
                autoFocus={autoFocus}
            />
            <div
                className="absolute inset-y-0 right-0 pr-3 flex items-center cursor-pointer"
                onClick={toggleVisibility}
                style={{ fontSize: 32, height: "100%" }}
            >
                {isVisible ? <VisibilityIcon /> : <VisibilityOffIcon />}
            </div>
        </div>
        <InputError message={error} className="mt-2 text-base sm:text-lg" />
    </div>
);
