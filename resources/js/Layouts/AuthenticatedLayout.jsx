import ApplicationLogo from "@/Components/ApplicationLogo";
import Dropdown from "@/Components/Dropdown";
import NavLink from "@/Components/NavLink";
import ResponsiveNavLink from "@/Components/ResponsiveNavLink";
import { Link, usePage } from "@inertiajs/react";
import { useState } from "react";

export default function AuthenticatedLayout({ header, children }) {
    const user = usePage().props.auth.user;
    const currentUrl = usePage().url;
    const [showingNavigationDropdown, setShowingNavigationDropdown] =
        useState(false);

    const toggleNavigationDropdown = () => {
        setShowingNavigationDropdown((prevState) => !prevState);
    };

    const isHomePage = currentUrl === "/home";

    return (
        <div className="min-h-screen bg-gray-100">
            <nav className="border-b border-gray-100 bg-customPink">
                <div className="mx-auto max-w-7xl px-6 sm:px-8 lg:px-10">
                    <div className="flex h-24 justify-between">
                        <div className="flex">
                            <div className="flex shrink-0 items-center">
                                <Link
                                    href="/home"
                                    className="flex flex-col items-center"
                                >
                                    <img
                                        src="/img/logo.png"
                                        alt="Logo"
                                        className="block h-16 w-auto fill-current text-gray-800"
                                    />
                                    {!isHomePage && (
                                        <span className="text-sm text-gray-800">
                                            ホームに戻る
                                        </span>
                                    )}
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
                                <VerticalDivider />
                                <NavItem
                                    href="/weather"
                                    icon="/img/weather-icon.png"
                                    label="天気"
                                />
                                <VerticalDivider />
                                <NavItem
                                    href="/connection"
                                    icon="/img/connection-icon.png"
                                    label="接続"
                                    className="ms-8"
                                />
                                <VerticalDivider />
                            </div>
                            <UserDropdown user={user} />
                        </div>
                        <div className="-me-2 flex items-center sm:hidden">
                            <button
                                onClick={toggleNavigationDropdown}
                                className="inline-flex items-center justify-center rounded-md p-3 text-gray-800 transition duration-150 ease-in-out focus:outline-none"
                            >
                                {showingNavigationDropdown ? (
                                    <CloseIcon />
                                ) : (
                                    <DropdownIcon />
                                )}
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
            <img
                src={icon}
                alt={`${label} Icon`}
                className="h-icon-size w-icon-size mb-1"
            />
            {label}
        </Link>
    );
}

function VerticalDivider() {
    return <div className="h-6 border-l-2 border-white"></div>;
}

function UserDropdown({ user }) {
    const [open, setOpen] = useState(false);

    const toggleDropdown = () => {
        setOpen((prevState) => !prevState);
    };

    return (
        <div className="relative ms-6">
            <Dropdown>
                <Dropdown.Trigger>
                    <span className="inline-flex rounded-md">
                        <button
                            type="button"
                            onClick={toggleDropdown}
                            className="inline-flex items-center rounded-md bg-transparent px-4 py-3 text-lg leading-5 text-gray-800 transition duration-150 ease-in-out focus:outline-none"
                        >
                            {user.name}
                            <div className="flex flex-col items-center ms-2">
                                <img
                                    src="/img/menu-icon.png"
                                    alt="Menu Icon"
                                    className="h-icon-size w-icon-size mb-1"
                                />
                                <span className="text-icon-text text-gray-800">
                                    メニュー
                                </span>
                            </div>
                        </button>
                    </span>
                </Dropdown.Trigger>
                <Dropdown.Content>
                    <Dropdown.Link
                        href={route("profile.edit")}
                        className="flex items-center py-2"
                    >
                        <img
                            src="/img/profile-icon.png"
                            alt="Profile Icon"
                            className="h-icon-size w-icon-size mr-2"
                        />
                        <div className="flex flex-col">
                            <span>{user.nickname}</span>
                            <span>{user.login_id}</span>
                        </div>
                    </Dropdown.Link>
                    <Divider />
                    <Dropdown.Link
                        href="/calendar"
                        className="flex items-center py-2"
                    >
                        <img
                            src="/img/calendar-icon.png"
                            alt="Calendar Icon"
                            className="h-icon-size w-icon-size mr-2"
                        />
                        カレンダー
                    </Dropdown.Link>
                    <Divider />
                    <Dropdown.Link
                        href="/chat"
                        className="flex items-center py-2"
                    >
                        <img
                            src="/img/chat-icon.png"
                            alt="Chat Icon"
                            className="h-icon-size w-icon-size mr-2"
                        />
                        お喋り
                    </Dropdown.Link>
                    <Divider />
                    <Dropdown.Link
                        href={route("logout")}
                        method="post"
                        as="button"
                        className="flex items-center py-2"
                    >
                        <img
                            src="/img/logout-icon.png"
                            alt="Logout Icon"
                            className="h-icon-size w-icon-size mr-2"
                        />
                        ログアウト
                    </Dropdown.Link>
                </Dropdown.Content>
            </Dropdown>
        </div>
    );
}

function DropdownIcon() {
    return (
        <div className="flex flex-col items-center">
            <img
                src="/img/dropdown-icon.png"
                alt="Dropdown Icon"
                className="h-icon-size w-icon-size"
            />
            <span className="text-icon-text text-gray-800">メニュー</span>
        </div>
    );
}

function CloseIcon() {
    return (
        <div className="flex flex-col items-center">
            <img
                src="/img/close-icon.png"
                alt="Close Icon"
                className="h-icon-size w-icon-size"
            />
            <span className="text-icon-text text-gray-800">閉じる</span>
        </div>
    );
}

function ResponsiveNavigation({ showing }) {
    const user = usePage().props.auth.user;

    return (
        <div className={(showing ? "block" : "hidden") + " sm:hidden bg-white"}>
            <div className="space-y-4 pb-6 pt-4">
                <ResponsiveNavLink
                    href={route("profile.edit")}
                    className="text-lg flex items-center"
                >
                    <img
                        src="/img/profile-icon.png"
                        alt="Profile Icon"
                        className="h-icon-size w-icon-size mr-4"
                    />
                    <div className="flex flex-col">
                        <span>{user.nickname}</span>
                        <span>{user.login_id}</span>
                    </div>
                </ResponsiveNavLink>
                <Divider />
                <ResponsiveNavLink
                    href="/schedule"
                    className="text-lg flex items-center"
                >
                    <img
                        src="/img/schedule-icon.png"
                        alt="Schedule Icon"
                        className="h-icon-size w-icon-size mr-4"
                    />
                    本日の予定
                </ResponsiveNavLink>
                <Divider />
                <ResponsiveNavLink
                    href="/weather"
                    className="text-lg flex items-center"
                >
                    <img
                        src="/img/weather-icon.png"
                        alt="Weather Icon"
                        className="h-icon-size w-icon-size mr-4"
                    />
                    天気
                </ResponsiveNavLink>
                <Divider />
                <ResponsiveNavLink
                    href="/connection"
                    className="text-lg flex items-center"
                >
                    <img
                        src="/img/connection-icon.png"
                        alt="Connection Icon"
                        className="h-icon-size w-icon-size mr-4"
                    />
                    接続
                </ResponsiveNavLink>
                <Divider />
                <ResponsiveNavLink
                    href="/calendar"
                    className="text-lg flex items-center"
                >
                    <img
                        src="/img/calendar-icon.png"
                        alt="Calendar Icon"
                        className="h-icon-size w-icon-size mr-4"
                    />
                    カレンダー
                </ResponsiveNavLink>
                <Divider />
                <ResponsiveNavLink
                    href="/chat"
                    className="text-lg flex items-center"
                >
                    <img
                        src="/img/chat-icon.png"
                        alt="Chat Icon"
                        className="h-icon-size w-icon-size mr-4"
                    />
                    お喋り
                </ResponsiveNavLink>
                <Divider />
                <div className="mt-6 space-y-4">
                    <ResponsiveNavLink
                        method="post"
                        href={route("logout")}
                        as="button"
                        className="text-lg flex items-center"
                    >
                        <img
                            src="/img/logout-icon.png"
                            alt="Logout Icon"
                            className="h-icon-size w-icon-size mr-4"
                        />
                        ログアウト
                    </ResponsiveNavLink>
                </div>
            </div>
        </div>
    );
}

function Divider() {
    return <div className="h-0.5 bg-gray-300 my-4"></div>;
}
