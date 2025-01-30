import React, { useState } from "react";
import { useForm } from "@inertiajs/react";
import InputError from "@/Components/InputError";
import InputLabel from "@/Components/InputLabel";
import PrimaryButton from "@/Components/PrimaryButton";
import TextInput from "@/Components/TextInput";
import DeleteProfileModal from "@/Pages/Profile/Partials/Modals/DeleteProfileModal";
import { Transition } from "@headlessui/react";

export default function DeleteProfileForm({ className = "" }) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [successMessage, setSuccessMessage] = useState("");

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

    const deleteUser = (e) => {
        e.preventDefault();

        destroy(route("profile.destroy"), {
            preserveScroll: true,
            onSuccess: () => {
                setIsModalOpen(false);
                reset();
            },
            onError: (errors) => {
                reset("password");
            },
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

            <PrimaryButton
                onClick={() => setIsModalOpen(true)}
                className="bg-red-600 hover:bg-red-800 mt-4"
            >
                アカウント削除
            </PrimaryButton>

            <DeleteProfileModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                data={data}
                setData={setData}
                errors={errors}
                deleteUser={deleteUser}
                processing={processing}
            />

            <Transition
                show={!!successMessage}
                enter="transition ease-in-out duration-300"
                enterFrom="opacity-0"
                enterTo="opacity-100"
                leave="transition ease-in-out duration-300"
                leaveFrom="opacity-100"
                leaveTo="opacity-0"
            >
                <p className="mt-4 text-sm text-green-600">{successMessage}</p>
            </Transition>
        </section>
    );
}
