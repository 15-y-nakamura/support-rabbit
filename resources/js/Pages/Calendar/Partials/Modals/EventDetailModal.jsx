import React, { useState } from "react";
import EditEventForm from "../Forms/EditEventForm"; // Import the EditEventForm component

export default function EventDetailModal({ event, onEdit, onClose }) {
    const [isEditing, setIsEditing] = useState(false); // State to handle edit mode

    const handleEditClick = () => {
        setIsEditing(true);
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
                {isEditing ? (
                    <EditEventForm
                        event={event}
                        onEventUpdated={onEdit}
                        onCancel={() => setIsEditing(false)}
                    />
                ) : (
                    <div className="space-y-4">
                        <div className="flex flex-col space-y-2">
                            <label className="font-bold">予定名</label>
                            <p className="p-2 border border-gray-300 rounded">
                                {event.title}
                            </p>
                        </div>
                        <hr className="my-4" />
                        <div className="flex flex-col md:flex-row md:space-x-4">
                            <div className="flex flex-col flex-1 space-y-2">
                                <label className="font-bold">開始日時</label>
                                <p className="p-2 border border-gray-300 rounded">
                                    {new Date(
                                        event.start_time
                                    ).toLocaleString()}
                                </p>
                            </div>
                            <div className="flex flex-col flex-1 space-y-2">
                                <label className="font-bold">終了日時</label>
                                <p className="p-2 border border-gray-300 rounded">
                                    {new Date(event.end_time).toLocaleString()}
                                </p>
                            </div>
                        </div>
                        <div className="flex flex-col space-y-2">
                            <label className="font-bold">繰り返し設定</label>
                            <p className="p-2 border border-gray-300 rounded">
                                {event.recurrence_type !== "none"
                                    ? event.recurrence_type
                                    : "未設定"}
                            </p>
                        </div>
                        <div className="flex flex-col space-y-2">
                            <label className="font-bold">終日設定</label>
                            <p className="p-2 border border-gray-300 rounded">
                                {event.all_day ? "はい" : "未設定"}
                            </p>
                        </div>
                        <hr className="my-4" />
                        <div className="flex flex-col space-y-2">
                            <label className="font-bold">場所</label>
                            <p className="p-2 border border-gray-300 rounded">
                                {event.location}
                            </p>
                        </div>
                        <div className="flex flex-col space-y-2">
                            <label className="font-bold">リンク</label>
                            <p className="p-2 border border-gray-300 rounded">
                                {event.link}
                            </p>
                        </div>
                        <div className="flex flex-col space-y-2">
                            <label className="font-bold">タグ</label>
                            {event.tag ? (
                                <div
                                    className="p-2 border border-gray-300 rounded"
                                    style={{
                                        backgroundColor: event.tag.color,
                                    }}
                                >
                                    {event.tag.name}
                                </div>
                            ) : (
                                <p className="p-2 border border-gray-300 rounded">
                                    タグが選択されていません
                                </p>
                            )}
                        </div>
                        <div className="flex flex-col space-y-2">
                            <label className="font-bold">メモ</label>
                            <p className="p-2 border border-gray-300 rounded">
                                {event.note}
                            </p>
                        </div>
                        <div className="flex justify-between mt-4">
                            <button
                                type="button"
                                onClick={handleEditClick}
                                className="bg-blue-500 text-white p-2 rounded"
                            >
                                編集
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
