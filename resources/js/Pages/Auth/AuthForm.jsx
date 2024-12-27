import React, { useState } from "react";
import { Head } from "@inertiajs/react";
import LoginForm from "./LoginForm";
import RegisterForm from "./RegisterForm";

export default function AuthForm() {
    const [isLogin, setIsLogin] = useState(true);

    return (
        <div className="flex min-h-screen flex-col items-center bg-[#FFF6EA] pt-6 sm:justify-center sm:pt-0">
            <div className="flex justify-center mb-4">
                <img src="/img/logo.png" alt="Logo" className="h-24 sm:h-36" />
            </div>
            <div className="text-center mb-4">
                <h1 className="text-xl sm:text-2xl font-semibold text-gray-700">
                    {isLogin ? "こんにちは" : "初めまして"}
                </h1>
            </div>
            <Head title={isLogin ? "ログイン" : "新規登録"} />
            <div className="w-full max-w-sm sm:max-w-md">
                <div className="bg-white shadow-md rounded-lg overflow-hidden">
                    <div className="flex justify-center">
                        <button
                            className={`w-1/2 py-2 sm:py-4 text-gray-700 font-medium ${
                                isLogin ? "bg-customPink" : "bg-[#FFB6C1]"
                            }`}
                            onClick={() => setIsLogin(true)}
                        >
                            ログイン
                        </button>
                        <button
                            className={`w-1/2 py-2 sm:py-4 text-gray-700 font-medium ${
                                !isLogin ? "bg-customPink" : "bg-[#FFB6C1]"
                            }`}
                            onClick={() => setIsLogin(false)}
                        >
                            新規登録
                        </button>
                    </div>
                    <div className="p-4 sm:p-6">
                        {isLogin ? <LoginForm /> : <RegisterForm />}
                    </div>
                </div>
            </div>
        </div>
    );
}
