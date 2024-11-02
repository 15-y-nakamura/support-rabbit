import ApplicationLogo from "@/Components/ApplicationLogo";
import Dropdown from "@/Components/Dropdown";
import NavLink from "@/Components/NavLink";
import ResponsiveNavLink from "@/Components/ResponsiveNavLink";
import { Link, usePage } from "@inertiajs/react";
import { useState } from "react";

export default function AuthenticatedLayout({ header, children }) {
    const user = usePage().props.auth.user;
    const [showingNavigationDropdown, setShowingNavigationDropdown] =
        useState(false);

    const toggleNavigationDropdown = () => {
        setShowingNavigationDropdown((prevState) => !prevState);
    };

    return (
        <div className="min-h-screen bg-gray-100">
            <nav className="border-b border-gray-100 bg-customPink">
                <div className="mx-auto max-w-7xl px-6 sm:px-8 lg:px-10">
                    <div className="flex h-24 justify-between">
                        <div className="flex">
                            <div className="flex shrink-0 items-center">
                                <Link href="/home">
                                    <img
                                        src="/img/logo.png"
                                        alt="Logo"
                                        className="block h-16 w-auto fill-current text-gray-800"
                                    />
                                </Link>
                                <Link
                                    href="/home"
                                    className="ml-4 text-xl text-gray-800"
                                >
                                    ホーム
                                </Link>
                            </div>
                        </div>
                        <div className="hidden sm:ms-8 sm:flex sm:items-center">
                            <div className="flex items-center space-x-8 sm:space-x-6">
                                <NavItem
                                    href="/schedule"
                                    icon="/img/schedule-icon.png"
                                    label="本日の予定"
                                />
                                <Divider />
                                <NavItem
                                    href="/weather"
                                    icon="/img/weather-icon.png"
                                    label="天気"
                                />
                                <Divider />
                                <NavItem
                                    href="/connection"
                                    icon="/img/connection-icon.png"
                                    label="接続"
                                    className="ms-8"
                                />
                                <Divider />
                            </div>
                            <UserDropdown user={user} />
                        </div>
                        <div className="-me-2 flex items-center sm:hidden">
                            <button
                                onClick={toggleNavigationDropdown}
                                className="inline-flex items-center justify-center rounded-md p-3 text-gray-800 transition duration-150 ease-in-out focus:outline-none"
                            >
                                <DropdownIcon />
                            </button>
                        </div>
                    </div>
                </div>

                <ResponsiveNavigation showing={showingNavigationDropdown} />
            </nav>

            {header && (
                <header className="bg-white shadow">
                    <div className="mx-auto max-w-7xl px-6 py-8 sm:px-8 lg:px-10">
                        {header}
                    </div>
                </header>
            )}

            <main>{children}</main>
        </div>
    );
}

function NavItem({ href, icon, label, className }) {
    return (
        <Link
            href={href}
            className={`text-lg text-gray-800 flex flex-col items-center ${className}`}
        >
            <img src={icon} alt={`${label} Icon`} className="h-6 w-6 mb-1" />
            {label}
        </Link>
    );
}

function Divider() {
    return <div className="h-6 border-l-2 border-white"></div>;
}

function UserDropdown({ user }) {
    return (
        <div className="relative ms-6">
            <Dropdown>
                <Dropdown.Trigger>
                    <span className="inline-flex rounded-md">
                        <button
                            type="button"
                            className="inline-flex items-center rounded-md bg-transparent px-4 py-3 text-lg leading-5 text-gray-800 transition duration-150 ease-in-out focus:outline-none"
                        >
                            {user.name}
                            <DropdownIcon />
                        </button>
                    </span>
                </Dropdown.Trigger>
                <Dropdown.Content>
                    <Dropdown.Link href={route("profile.edit")}>
                        Profile
                    </Dropdown.Link>
                    <Dropdown.Link
                        href={route("logout")}
                        method="post"
                        as="button"
                    >
                        Log Out
                    </Dropdown.Link>
                </Dropdown.Content>
            </Dropdown>
        </div>
    );
}

function DropdownIcon() {
    return (
        <div className="flex flex-col items-center ms-2">
            <img
                src="/img/dropdown-icon.png"
                alt="Dropdown Icon"
                className="h-6 w-6 mb-1"
            />
            <span className="text-lg text-gray-800 flex flex-col items-center">
                メニュー
            </span>
        </div>
    );
}

function ResponsiveNavigation({ showing }) {
    return (
        <div className={(showing ? "block" : "hidden") + " sm:hidden"}>
            <div className="space-y-2 pb-4 pt-3">
                <ResponsiveNavLink
                    href="/schedule"
                    className="text-lg text-gray-800 flex flex-col items-center"
                >
                    <img
                        src="/img/schedule-icon.png"
                        alt="Schedule Icon"
                        className="h-6 w-6 mb-1"
                    />
                    本日の予定
                </ResponsiveNavLink>
                <ResponsiveNavLink
                    href="/weather"
                    className="text-lg text-gray-800 flex flex-col items-center"
                >
                    <img
                        src="/img/weather-icon.png"
                        alt="Weather Icon"
                        className="h-6 w-6 mb-1"
                    />
                    天気
                </ResponsiveNavLink>
                <div className="mt-4 space-y-2">
                    <ResponsiveNavLink href={route("profile.edit")}>
                        Profile
                    </ResponsiveNavLink>
                    <ResponsiveNavLink
                        method="post"
                        href={route("logout")}
                        as="button"
                    >
                        Log Out
                    </ResponsiveNavLink>
                </div>
            </div>
        </div>
    );
}
