import { defineConfig } from "vite";
import laravel from "laravel-vite-plugin";
import react from "@vitejs/plugin-react";
import path from "path";
import dotenv from "dotenv";

// 環境変数を読み込む
dotenv.config();

export default defineConfig({
    plugins: [
        laravel({
            input: "resources/js/app.jsx",
            refresh: true,
        }),
        react(),
    ],
    resolve: {
        alias: {
            "@": path.resolve(__dirname, "resources/js"),
        },
    },
    server: {
        host: true,
        hmr: {
            host: "localhost",
        },
    },
    define: {
        "process.env": process.env,
    },
});
