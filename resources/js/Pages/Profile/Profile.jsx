import React, { useState } from "react";
import axios from "axios";
import HeaderSidebarLayout from "@/Layouts/HeaderSidebarLayout";
import { Head, usePage, Link } from "@inertiajs/react";
import DeleteProfileForm from "./Partials/Forms/DeleteProfileForm";
import UpdatePasswordForm from "./Partials/Forms/UpdatePasswordForm";
import UpdateProfileForm from "./Partials/Forms/UpdateProfileForm";

export default function Profile() {
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
            setError("認証トークンが見つかりません");
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
                setStatus("プロフィールが正常に更新されました");
            })
            .catch((error) => {
                setError("プロフィールの更新中にエラーが発生しました！");
                console.error(error);
            });
    };

    const handleUpdatePassword = (currentPassword, newPassword) => {
        const token = localStorage.getItem("token");
        if (!token) {
            setError("認証トークンが見つかりません");
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
                setStatus("パスワードが正常に更新されました");
            })
            .catch((error) => {
                setError("パスワードの更新中にエラーが発生しました！");
                console.error(error);
            });
    };

    const handleDeleteAccount = (password) => {
        const token = localStorage.getItem("token");
        if (!token) {
            setError("認証トークンが見つかりません");
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
                setStatus("アカウントが正常に削除されました");
            })
            .catch((error) => {
                setError("アカウントの削除中にエラーが発生しました！");
                console.error(error);
            });
    };

    if (error) {
        return <div>{error}</div>;
    }

    return (
        <HeaderSidebarLayout>
            <Head title="プロフィール" />

            <div className="py-12 bg-[#FFF6EA]">
                <div className="mx-auto max-w-7xl space-y-6 sm:px-6 lg:px-8">
                    <div className="bg-white p-4 shadow sm:rounded-lg sm:p-8">
                        <UpdateProfileForm
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
                        <DeleteProfileForm
                            className="max-w-xl"
                            onDeleteAccount={handleDeleteAccount}
                        />
                    </div>
                </div>
            </div>
        </HeaderSidebarLayout>
    );
}
