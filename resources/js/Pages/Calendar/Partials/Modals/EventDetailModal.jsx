import React, { useState, useEffect } from "react";
import axios from "axios";
import EditEventForm from "../Forms/EditEventForm"; // Import the EditEventForm component

export default function EventDetailModal({ event, onEdit, onClose }) {
    const [isEditing, setIsEditing] = useState(false); // State to handle edit mode
    const [tag, setTag] = useState(null); // State to store tag information
    const [isLoading, setIsLoading] = useState(false); // State to handle loading
    const [tagNotFound, setTagNotFound] = useState(false); // State to handle tag not found

    const handleEditClick = () => {
        setIsEditing(true);
    };

    const getRecurrenceTypeLabel = (recurrenceType) => {
        switch (recurrenceType) {
            case "none":
                return "未設定";
            case "weekday":
                return "平日";
            case "weekend":
                return "週末";
            case "weekly":
                return "毎週";
            case "monthly":
                return "毎月";
            case "yearly":
                return "毎年";
            default:
                return "未設定";
        }
    };

    useEffect(() => {
        const fetchTag = async () => {
            if (event.tag_id) {
                setIsLoading(true);
                setTagNotFound(false);
                try {
                    const token = localStorage.getItem("authToken");
                    const response = await axios.get(
                        `/api/v2/calendar/tags/${event.tag_id}`,
                        {
                            headers: { Authorization: `Bearer ${token}` },
                        }
                    );
                    setTag(response.data);
                } catch (error) {
                    if (error.response && error.response.status === 404) {
                        setTagNotFound(true);
                    } else {
                        console.error("Error fetching tag:", error);
                    }
                } finally {
                    setIsLoading(false);
                }
            }
        };

        fetchTag();
    }, [event.tag_id]);

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
                                {event.title || "未設定"}
                            </p>
                        </div>
                        <hr className="my-4" />
                        <div className="flex flex-col md:flex-row md:space-x-4">
                            <div className="flex flex-col flex-1 space-y-2">
                                <label className="font-bold">開始日時</label>
                                <p className="p-2 border border-gray-300 rounded">
                                    {event.start_time
                                        ? `${new Date(
                                              event.start_time
                                          ).toLocaleDateString()} ${new Date(
                                              event.start_time
                                          ).toLocaleTimeString([], {
                                              hour: "2-digit",
                                              minute: "2-digit",
                                          })}`
                                        : "未設定"}
                                </p>
                            </div>
                            <div className="flex flex-col flex-1 space-y-2 mt-4 md:mt-0">
                                <label className="font-bold">終了日時</label>
                                <p className="p-2 border border-gray-300 rounded">
                                    {event.end_time
                                        ? `${new Date(
                                              event.end_time
                                          ).toLocaleDateString()} ${new Date(
                                              event.end_time
                                          ).toLocaleTimeString([], {
                                              hour: "2-digit",
                                              minute: "2-digit",
                                          })}`
                                        : "未設定"}
                                </p>
                            </div>
                        </div>
                        <div className="flex flex-col space-y-2">
                            <label className="font-bold">繰り返し設定</label>
                            <p className="p-2 border border-gray-300 rounded">
                                {getRecurrenceTypeLabel(event.recurrence_type)}
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
                                {event.location || "未設定"}
                            </p>
                        </div>
                        <div className="flex flex-col space-y-2">
                            <label className="font-bold">リンク</label>
                            <p className="p-2 border border-gray-300 rounded">
                                {event.link || "未設定"}
                            </p>
                        </div>
                        <div className="flex flex-col space-y-2">
                            <label className="font-bold">タグ</label>
                            {isLoading ? (
                                <p className="p-2 border border-gray-300 rounded">
                                    タグを取得中です...
                                </p>
                            ) : tag ? (
                                <div
                                    className="p-2 border border-gray-300 rounded"
                                    style={{
                                        backgroundColor: tag.color,
                                    }}
                                >
                                    {tag.name}
                                </div>
                            ) : tagNotFound ? (
                                <p className="p-2 border border-gray-300 rounded text-gray-500">
                                    (タグが削除されています)
                                </p>
                            ) : (
                                <p className="p-2 border border-gray-300 rounded">
                                    タグが選択されていません
                                </p>
                            )}
                        </div>
                        <div className="flex flex-col space-y-2">
                            <label className="font-bold">メモ</label>
                            <p className="p-2 border border-gray-300 rounded">
                                {event.note || "未設定"}
                            </p>
                        </div>
                        <div className="flex justify-end mt-4">
                            <button
                                type="button"
                                onClick={handleEditClick}
                                className="bg-customBlue hover:bg-blue-400 text-white p-2 rounded"
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
