import defaultTheme from "tailwindcss/defaultTheme";
import forms from "@tailwindcss/forms";

/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./vendor/laravel/framework/src/Illuminate/Pagination/resources/views/*.blade.php",
        "./storage/framework/views/*.php",
        "./resources/views/**/*.blade.php",
        "./resources/js/**/*.jsx",
    ],

    theme: {
        extend: {
            fontFamily: {
                sans: ["Figtree", ...defaultTheme.fontFamily.sans],
            },
            colors: {
                customPink: "#F0A0A8", // ここにカスタムカラーを追加
            },
            fontSize: {
                "icon-text": "1rem", // アイコンのテキストサイズ
            },
            spacing: {
                "icon-size": "1.5rem", // アイコンのサイズ
            },
        },
    },

    plugins: [forms],
};
