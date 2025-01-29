import React, { useState } from "react";
import { useForm } from "@inertiajs/react";
import InputError from "@/Components/InputError";
import InputLabel from "@/Components/InputLabel";
import PrimaryButton from "@/Components/PrimaryButton";
import TextInput from "@/Components/TextInput";

export default function DeleteProfileForm({ className = "" }) {
    const [confirmingUserDeletion, setConfirmingUserDeletion] = useState(false);
    const {
        data,
        setData,
        delete: destroy,
        processing,
        reset,
        errors,
    } = useForm({
        password: "",
    });

    const confirmUserDeletion = () => {
        setConfirmingUserDeletion(true);
    };

    const deleteUser = (e) => {
        e.preventDefault();

        if (
            !confirm(
                "本当にアカウントを削除しますか？この操作は取り消せません。"
            )
        ) {
            return;
        }

        destroy(route("profile.destroy"), {
            preserveScroll: true,
            onSuccess: () => reset(),
            onError: () => reset("password"),
        });
    };

    return (
        <section className={className}>
            <header>
                <h2 className="text-lg font-medium text-gray-900">
                    アカウント削除
                </h2>

                <p className="mt-1 text-sm text-gray-600">
                    アカウントを削除すると、すべてのデータが完全に削除されます。
                </p>
            </header>

            <form onSubmit={deleteUser} className="mt-6 space-y-6">
                <div>
                    <InputLabel htmlFor="delete_password" value="パスワード" />

                    <TextInput
                        id="delete_password"
                        type="password"
                        className="mt-1 block w-full"
                        value={data.password}
                        onChange={(e) => setData("password", e.target.value)}
                        required
                        placeholder="パスワード"
                    />

                    <InputError message={errors.password} className="mt-2" />
                </div>

                <div className="flex items-center gap-4">
                    <PrimaryButton
                        onClick={confirmUserDeletion}
                        disabled={processing}
                        className="bg-red-600 hover:bg-red-800"
                    >
                        アカウント削除
                    </PrimaryButton>
                </div>
            </form>
        </section>
    );
}
