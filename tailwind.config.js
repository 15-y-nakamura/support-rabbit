import defaultTheme from "tailwindcss/defaultTheme";
import forms from "@tailwindcss/forms";

/** @type {import('tailwindcss').Config} */
export default {
    // Tailwind CSSが適用されるファイルのパスを指定
    content: [
        "./vendor/laravel/framework/src/Illuminate/Pagination/resources/views/*.blade.php",
        "./storage/framework/views/*.php",
        "./resources/views/**/*.blade.php",
        "./resources/js/**/*.jsx",
    ],

    theme: {
        extend: {
            // カスタムフォントファミリーの設定
            fontFamily: {
                sans: ["Figtree", ...defaultTheme.fontFamily.sans],
                comic: ["Comic Sans MS", "cursive", "sans-serif"],
            },
            // カスタムカラーの設定
            colors: {
                customPink: "#F0A0A8",
                cream: "#FFF8E7",
                pink: {
                    50: "#FFF1F3",
                    200: "#FFC1C8",
                    500: "#F78FB3",
                },
                customGreen: "#65BC8B",
            },
            // カスタムフォントサイズの設定
            fontSize: {
                "icon-text": "1rem",
            },
            // カスタムスペーシングの設定
            spacing: {
                "icon-size": "1.5rem",
            },
            // カスタムブレークポイントの設定
            screens: {
                "max-sm": { max: "639px" },
                "max-md": { max: "767px" },
                "max-lg": { max: "1023px" },
                "max-xl": { max: "1279px" },
                "max-2xl": { max: "1535px" },
            },
        },
    },

    // Tailwind CSSプラグインの設定
    plugins: [forms],
};
