import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head } from "@inertiajs/react";
import { useEffect } from "react";

export default function Home() {
    return (
        <AuthenticatedLayout>
            <Head title="ホーム画面" />
        </AuthenticatedLayout>
    );
}
