import HeaderSidebarLayout from "@/Layouts/HeaderSidebarLayout";
import { Head } from "@inertiajs/react";

export default function Calendar() {
    return (
        <HeaderSidebarLayout>
            <Head title="カレンダー" />
            <Schedule />
        </HeaderSidebarLayout>
    );
}
