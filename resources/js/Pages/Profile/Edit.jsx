import React, { useState } from "react";
import axios from "axios";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, usePage, Link } from "@inertiajs/react";
import DeleteUserForm from "./Partials/DeleteUserForm";
import UpdatePasswordForm from "./Partials/UpdatePasswordForm";
import UpdateProfileInformationForm from "./Partials/UpdateProfileInformationForm";

export default function Edit() {
    const { auth } = usePage().props;
    const [profile, setProfile] = useState(auth.user);
    const [mustVerifyEmail, setMustVerifyEmail] = useState(false);
    const [status, setStatus] = useState(null);
    const [error, setError] = useState(null);

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const day = String(date.getDate()).padStart(2, "0");
        return `${year}-${month}-${day}`;
    };

    const handleUpdateProfile = (nickname, email, birthday, login_id) => {
        const token = localStorage.getItem("token");
        if (!token) {
            setError("No authentication token found");
            return;
        }

        axios
            .put(
                "/v2/profiles",
                { nickname, email, birthday: formatDate(birthday), login_id },
                {
                    withCredentials: true,
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            )
            .then((response) => {
                setProfile(response.data.user);
                setStatus("Profile updated successfully");
            })
            .catch((error) => {
                setError("There was an error updating the profile!");
                console.error(error);
            });
    };

    const handleUpdatePassword = (currentPassword, newPassword) => {
        const token = localStorage.getItem("token");
        if (!token) {
            setError("No authentication token found");
            return;
        }

        axios
            .put(
                "/v2/profiles/password",
                { currentPassword, newPassword },
                {
                    withCredentials: true,
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            )
            .then((response) => {
                setStatus("Password updated successfully");
            })
            .catch((error) => {
                setError("There was an error updating the password!");
                console.error(error);
            });
    };

    const handleDeleteAccount = (password) => {
        const token = localStorage.getItem("token");
        if (!token) {
            setError("No authentication token found");
            return;
        }

        axios
            .delete("/v2/profiles", {
                data: { password },
                withCredentials: true,
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            })
            .then((response) => {
                setStatus("Account deleted successfully");
            })
            .catch((error) => {
                setError("There was an error deleting the account!");
                console.error(error);
            });
    };

    if (error) {
        return <div>{error}</div>;
    }

    return (
        <AuthenticatedLayout>
            <Head title="Profile" />

            <div className="py-12 bg-[#FFF6EA]">
                <div className="mx-auto max-w-7xl space-y-6 sm:px-6 lg:px-8">
                    <div className="bg-white p-4 shadow sm:rounded-lg sm:p-8">
                        <UpdateProfileInformationForm
                            mustVerifyEmail={mustVerifyEmail}
                            status={status}
                            className="max-w-xl"
                            onUpdateProfile={handleUpdateProfile}
                        />
                    </div>

                    <div className="bg-white p-4 shadow sm:rounded-lg sm:p-8">
                        <UpdatePasswordForm
                            className="max-w-xl"
                            onUpdatePassword={handleUpdatePassword}
                        />
                    </div>

                    <div className="bg-white p-4 shadow sm:rounded-lg sm:p-8">
                        <DeleteUserForm
                            className="max-w-xl"
                            onDeleteAccount={handleDeleteAccount}
                        />
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
