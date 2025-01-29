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
    const [passwordType, setPasswordType] = useState("password");
    const [passwordConfirmationType, setPasswordConfirmationType] =
        useState("password");

    const togglePasswordVisibility = () => {
        setPasswordType((prevType) =>
            prevType === "password" ? "text" : "password"
        );
    };

    const togglePasswordConfirmationVisibility = () => {
        setPasswordConfirmationType((prevType) =>
            prevType === "password" ? "text" : "password"
        );
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
            },
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
                        <div className="mt-4">
                            <InputLabel
                                htmlFor="password"
                                value="新しいパスワード"
                            />
                            <div className="relative">
                                <TextInput
                                    id="password"
                                    type={passwordType}
                                    name="password"
                                    value={data.password}
                                    className="mt-1 block w-full text-base sm:text-lg"
                                    autoComplete="new-password"
                                    placeholder="新しいパスワード"
                                    isFocused={true}
                                    onChange={(e) =>
                                        setData("password", e.target.value)
                                    }
                                    required
                                />
                                {passwordType === "password" ? (
                                    <VisibilityOffIcon
                                        onClick={togglePasswordVisibility}
                                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-sm leading-5 cursor-pointer"
                                        style={{
                                            fontSize: 32,
                                            height: "100%",
                                        }}
                                    />
                                ) : (
                                    <VisibilityIcon
                                        onClick={togglePasswordVisibility}
                                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-sm leading-5 cursor-pointer"
                                        style={{
                                            fontSize: 32,
                                            height: "100%",
                                        }}
                                    />
                                )}
                            </div>
                            <InputError
                                message={errors.password}
                                className="mt-2 text-base sm:text-lg"
                            />
                        </div>

                        <div className="mt-4">
                            <InputLabel
                                htmlFor="password_confirmation"
                                value="新しいパスワード（確認用）"
                            />
                            <div className="relative">
                                <TextInput
                                    type={passwordConfirmationType}
                                    id="password_confirmation"
                                    name="password_confirmation"
                                    value={data.password_confirmation}
                                    className="mt-1 block w-full text-base sm:text-lg"
                                    autoComplete="new-password"
                                    placeholder="新しいパスワード（確認用）"
                                    onChange={(e) =>
                                        setData(
                                            "password_confirmation",
                                            e.target.value
                                        )
                                    }
                                    required
                                />
                                {passwordConfirmationType === "password" ? (
                                    <VisibilityOffIcon
                                        onClick={
                                            togglePasswordConfirmationVisibility
                                        }
                                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-sm leading-5 cursor-pointer"
                                        style={{
                                            fontSize: 32,
                                            height: "100%",
                                        }}
                                    />
                                ) : (
                                    <VisibilityIcon
                                        onClick={
                                            togglePasswordConfirmationVisibility
                                        }
                                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-sm leading-5 cursor-pointer"
                                        style={{
                                            fontSize: 32,
                                            height: "100%",
                                        }}
                                    />
                                )}
                            </div>
                            <InputError
                                message={errors.password_confirmation}
                                className="mt-2 text-base sm:text-lg"
                            />
                        </div>
                        {errors.token ? (
                            <InputError
                                message={errors.token}
                                className="mt-2 text-base sm:text-lg"
                            />
                        ) : (
                            successMessage && (
                                <div className="mt-2 text-base sm:text-lg text-green-600">
                                    {successMessage}
                                </div>
                            )
                        )}

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
