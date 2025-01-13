import React from "react";

export default function CalendarDeleteConfirmationModal({
    isOpen,
    onClose,
    onDelete,
    isRecurring,
    recurrenceType,
}) {
    if (!isOpen) return null;

    const handleDelete = (deleteAll) => {
        if (recurrenceType === "weekday") {
            onDelete(deleteAll);
        } else {
            onDelete(false);
        }
    };

    return (
        <div className="fixed inset-0 flex items-center justify-center z-50">
            <div className="bg-white p-4 border border-red-500 rounded shadow-lg relative">
                <button
                    type="button"
                    onClick={onClose}
                    className="absolute top-0 right-0 mt-2 mr-2 text-gray-600"
                >
                    &times;
                </button>
                {recurrenceType === "weekday" ? (
                    <>
                        <p className="text-red-700">
                            このデータのみ削除しますか？それとも他の繰り返しデータも削除しますか？
                        </p>
                        <div className="flex justify-between mt-4">
                            <button
                                type="button"
                                onClick={() => handleDelete(false)}
                                className="bg-red-500 text-white p-2 rounded"
                            >
                                このデータのみ削除
                            </button>
                            <button
                                type="button"
                                onClick={() => handleDelete(true)}
                                className="bg-red-700 text-white p-2 rounded"
                            >
                                他のデータも削除
                            </button>
                        </div>
                    </>
                ) : (
                    <>
                        <p className="text-red-700">
                            削除してもよろしいですか？
                        </p>
                        <div className="flex justify-center mt-4">
                            <button
                                type="button"
                                onClick={() => handleDelete(false)}
                                className="bg-red-500 text-white p-2 rounded"
                            >
                                削除
                            </button>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
