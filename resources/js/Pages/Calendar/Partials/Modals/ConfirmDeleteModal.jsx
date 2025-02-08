import React, { useState } from "react";

export default function ConfirmDeleteModal({
    isOpen,
    onClose,
    onConfirm,
    relatedEvents = [],
    allSelected,
}) {
    const [isDeleting, setIsDeleting] = useState(false);

    if (!isOpen) return null;

    const handleConfirm = async () => {
        setIsDeleting(true);
        if (relatedEvents.length === 0 || allSelected) {
            await onConfirm();
            window.location.href = "/user/calendar";
        }
        setIsDeleting(false);
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-white p-6 rounded shadow-lg relative max-w-md w-full max-h-[90vh] overflow-y-auto sm:max-w-2xl">
                <button
                    type="button"
                    onClick={onClose}
                    className="absolute top-0 right-0 mt-2 mr-2 text-gray-600"
                >
                    &times;
                </button>
                <div className="space-y-4">
                    <h2 className="text-lg font-bold text-center">削除確認</h2>
                    <p className="text-red-700 text-center">
                        本当にこのタグを削除しますか？この操作は元に戻せません。
                    </p>
                    <div className="flex justify-center mt-4 space-x-8">
                        <button
                            type="button"
                            onClick={onClose}
                            className="bg-gray-300 hover:bg-gray-400 text-black px-4 py-2 rounded shadow-md"
                            disabled={isDeleting}
                        >
                            キャンセル
                        </button>
                        <button
                            type="button"
                            onClick={handleConfirm}
                            className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded shadow-md flex items-center justify-center"
                            disabled={isDeleting}
                        >
                            {isDeleting ? (
                                <div className="w-5 h-5 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
                            ) : (
                                "削除"
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
