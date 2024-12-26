import React, { useState, useEffect } from "react";
import { useForm, usePage } from "@inertiajs/react";
import InputError from "@/Components/InputError";
import InputLabel from "@/Components/InputLabel";
import PrimaryButton from "@/Components/PrimaryButton";
import TextInput from "@/Components/TextInput";

export default function DeleteUserForm({ className = "" }) {
    const { auth } = usePage().props;
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

    useEffect(() => {
        if (confirmingUserDeletion) {
            axios
                .get("/api/v2/profiles/delete")
                .then((response) => {
                    // 削除対象のデータを取得
                })
                .catch((error) => {
                    console.error(
                        "There was an error fetching the data!",
                        error
                    );
                });
        }
    }, [confirmingUserDeletion]);

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
                    />

                    <InputError message={errors.password} className="mt-2" />
                </div>

                <div className="flex items-center gap-4">
                    <PrimaryButton
                        onClick={confirmUserDeletion}
                        disabled={processing}
                    >
                        アカウント削除
                    </PrimaryButton>
                </div>
            </form>
        </section>
    );
}
