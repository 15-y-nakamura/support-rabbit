import React, { useState } from "react";
import EventModal from "@/Components/EventModal";
import InputLabel from "@/Components/InputLabel";
import TextInput from "@/Components/TextInput";
import InputError from "@/Components/InputError";
import PrimaryButton from "@/Components/PrimaryButton";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";

export default function DeleteProfileModal({
    isOpen,
    onClose,
    data = { password: "" }, // デフォルト値を設定
    setData,
    errors,
    deleteUser,
    processing,
}) {
    const [passwordType, setPasswordType] = useState("password");

    const togglePasswordVisibility = () => {
        setPasswordType((prevType) =>
            prevType === "password" ? "text" : "password"
        );
    };

    return (
        <EventModal isOpen={isOpen} onClose={onClose}>
            <h3 className="text-lg font-medium text-gray-900">
                本当に削除しますか？
            </h3>
            <p className="mt-2 text-sm text-gray-600">
                この操作は取り消せません。本当にアカウントを削除しますか？
            </p>

            <form onSubmit={deleteUser} className="mt-4 space-y-4">
                <div>
                    <InputLabel htmlFor="delete_password" value="パスワード" />
                    <div className="relative">
                        <TextInput
                            id="delete_password"
                            type={passwordType}
                            className="mt-1 block w-full"
                            value={data.password}
                            onChange={(e) =>
                                setData("password", e.target.value)
                            }
                            required
                            placeholder="パスワード"
                        />
                        <div
                            className="absolute inset-y-0 right-0 pr-3 flex items-center cursor-pointer"
                            onClick={togglePasswordVisibility}
                            style={{ width: "32px", height: "100%" }}
                        >
                            {passwordType === "password" ? (
                                <VisibilityOffIcon style={{ fontSize: 24 }} />
                            ) : (
                                <VisibilityIcon style={{ fontSize: 24 }} />
                            )}
                        </div>
                    </div>
                    <InputError message={errors.password} className="mt-2" />
                </div>

                <div className="flex justify-between gap-4">
                    <button
                        type="button"
                        onClick={onClose}
                        className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
                    >
                        キャンセル
                    </button>
                    <PrimaryButton
                        className="bg-red-600 hover:bg-red-800"
                        disabled={processing}
                    >
                        削除
                    </PrimaryButton>
                </div>
            </form>
        </EventModal>
    );
}
