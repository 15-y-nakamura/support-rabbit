import ApplicationLogo from "@/Components/ApplicationLogo";
import Dropdown from "@/Components/Dropdown";
import NavLink from "@/Components/NavLink";
import ResponsiveNavLink from "@/Components/ResponsiveNavLink";
import { Link, usePage } from "@inertiajs/react";
import { useState, useEffect } from "react";

export default function HeaderSidebarLayout({ header, children }) {
    const user = usePage().props.auth.user; // 現在のユーザー情報を取得
    const currentUrl = usePage().url; // 現在のURLを取得
    const [showingNavigationDropdown, setShowingNavigationDropdown] =
        useState(false); // ナビゲーションドロップダウンの表示状態を管理

    const toggleNavigationDropdown = () => {
        setShowingNavigationDropdown((prevState) => !prevState); // ドロップダウンの表示状態を切り替え
    };

    useEffect(() => {
        if (showingNavigationDropdown) {
            document.body.style.overflow = "hidden"; // スクロールを無効にする
        } else {
            document.body.style.overflow = "auto"; // スクロールを有効にする
        }
    }, [showingNavigationDropdown]);

    const isHomePage = currentUrl === "/user/calendar"; // 現在のURLがカレンダーページかどうかを判定

    // 現在のURLに基づいてページ名を決定
    const pageNames = {
        "/user/calendar": "カレンダー",
        "/user/weather": "天気",
        "/user/achievement": "達成数",
        "/user/profile/edit": "プロフィール",
    };
    const currentPageName = pageNames[currentUrl] || "カレンダー";

    return (
        <div className="min-h-screen bg-gray-100">
            <nav className="border-b border-gray-100 bg-customPink">
                <div className="mx-auto max-w-7xl px-6 sm:px-8 lg:px-10">
                    <div className="flex h-24 justify-between">
                        <div className="flex">
                            <div className="flex shrink-0 items-center">
                                <Link
                                    href="/user/calendar"
                                    className="flex flex-col items-center"
                                >
                                    <img
                                        src="/img/logos/logo.png"
                                        alt="Logo"
                                        className="block h-16 w-auto fill-current text-gray-800"
                                    />
                                    {!isHomePage && (
                                        <span className="text-sm text-gray-800">
                                            カレンダーに戻る
                                        </span>
                                    )}
                                </Link>
                                <span className="ml-4 text-xl text-gray-800">
                                    {currentPageName}
                                </span>
                            </div>
                        </div>
                        <div className="hidden sm:ms-8 sm:flex sm:items-center">
                            <div className="flex items-center space-x-8 sm:space-x-6">
                                <NavItem
                                    href={route("achievement")}
                                    icon="/img/icons/achievement-icon.png"
                                    label="達成数"
                                />
                                <VerticalDivider />
                                <NavItem
                                    href={route("weather")}
                                    icon="/img/icons/weather-icon.png"
                                    label="天気"
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

// ナビゲーションアイテムコンポーネント
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

// 垂直の区切り線コンポーネント
function VerticalDivider() {
    return <div className="h-6 border-l-2 border-white"></div>;
}

// ユーザードロップダウンコンポーネント
function UserDropdown({ user }) {
    const [open, setOpen] = useState(false);

    const toggleDropdown = () => {
        setOpen((prevState) => !prevState);
    };

    const dropdownLinks = [
        {
            href: route("profile.edit"),
            icon: "/img/icons/profile-icon.png",
            label: (
                <>
                    {user.nickname} <br /> ({user.login_id})
                </>
            ),
        },
        {
            href: route("calendar"),
            icon: "/img/icons/calendar-icon.png",
            label: "カレンダー",
        },
        {
            href: route("logout"),
            icon: "/img/icons/logout-icon.png",
            label: "ログアウト",
            method: "post",
            as: "button",
        },
    ];

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
                                    src="/img/icons/menu-icon.png"
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
                    {dropdownLinks.map((link, index) => (
                        <div key={index}>
                            <Dropdown.Link
                                href={link.href}
                                method={link.method}
                                as={link.as}
                                className="flex items-center py-2"
                            >
                                <img
                                    src={link.icon}
                                    alt={`${link.label} Icon`}
                                    className="h-icon-size w-icon-size mr-2"
                                />
                                <div className="flex flex-col">
                                    <span>{link.label}</span>
                                </div>
                            </Dropdown.Link>
                            {index < dropdownLinks.length - 1 && <Divider />}
                        </div>
                    ))}
                </Dropdown.Content>
            </Dropdown>
        </div>
    );
}

// ドロップダウンアイコンコンポーネント
function DropdownIcon() {
    return (
        <div className="flex flex-col items-center">
            <img
                src="/img/icons/dropdown-icon.png"
                alt="Dropdown Icon"
                className="h-icon-size w-icon-size"
            />
            <span className="text-icon-text text-gray-800">メニュー</span>
        </div>
    );
}

// 閉じるアイコンコンポーネント
function CloseIcon() {
    return (
        <div className="flex flex-col items-center">
            <img
                src="/img/icons/close-icon.png"
                alt="Close Icon"
                className="h-icon-size w-icon-size"
            />
            <span className="text-icon-text text-gray-800">閉じる</span>
        </div>
    );
}

// レスポンシブナビゲーションコンポーネント
function ResponsiveNavigation({ showing }) {
    const user = usePage().props.auth.user;

    const navLinks = [
        {
            href: route("profile.edit"),
            icon: "/img/icons/profile-icon.png",
            label: (
                <>
                    {user.nickname} <br /> ({user.login_id})
                </>
            ),
        },
        {
            href: route("weather"),
            icon: "/img/icons/weather-icon.png",
            label: "天気",
        },
        {
            href: route("calendar"),
            icon: "/img/icons/calendar-icon.png",
            label: "カレンダー",
        },
        {
            href: route("achievement"),
            icon: "/img/icons/achievement-icon.png",
            label: "達成数",
        },
        {
            href: route("logout"),
            icon: "/img/icons/logout-icon.png",
            label: "ログアウト",
            method: "post",
            as: "button",
        },
    ];

    return (
        <div
            className={`${
                showing ? "block" : "hidden"
            } sm:hidden bg-white h-screen overflow-hidden`}
        >
            <div className="flex flex-col justify-between h-full py-6">
                <div className="flex flex-col flex-grow overflow-y-auto">
                    {navLinks.map((link, index) => (
                        <div key={index}>
                            <div className="flex items-center py-2">
                                <ResponsiveNavLink
                                    href={link.href}
                                    method={link.method}
                                    as={link.as}
                                >
                                    <img
                                        src={link.icon}
                                        alt={`${link.label} Icon`}
                                        className="h-6 w-6 mr-3"
                                    />
                                    <span className="text-left">
                                        {link.label}
                                    </span>
                                </ResponsiveNavLink>
                            </div>
                            {index < navLinks.length - 1 && <Divider />}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

// 水平の区切り線コンポーネント
function Divider() {
    return <div className="h-0.5 bg-gray-300 my-2"></div>;
}
