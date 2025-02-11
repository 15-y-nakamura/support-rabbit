import React from "react";

const Loading = () => (
    <div className="fixed inset-0 flex items-center justify-center bg-white z-50">
        <div className="w-16 h-16 border-8 border-gray-200 border-t-pink-400 rounded-full animate-spin"></div>
    </div>
);

export default Loading;
