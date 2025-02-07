import React, { useState, useEffect } from "react";
import axios from "axios";
import EventDetailModal from "../Modals/EventDetailModal";

// 認証トークンを取得する関数
const getAuthToken = () => {
    const token = localStorage.getItem("authToken");
    if (!token) {
        console.error("Auth token is missing");
    }
    return token;
};

export default function EventList({
    selectedDateEvents,
    selectedEvents,
    handleEventSelect,
    handleDeleteSelectedEvents,
    fetchEvents, // カレンダーイベントを更新する関数を追加
    handleEventAchieved, // イベント達成時の関数を追加
}) {
    const [selectedEvent, setSelectedEvent] = useState(null);
    const [error, setError] = useState(null);
    const [tags, setTags] = useState({});
    const [isLoading, setIsLoading] = useState(false); // State to handle loading

    useEffect(() => {
        const fetchTags = async () => {
            setIsLoading(true);
            const token = getAuthToken();
            const tagIds = selectedDateEvents
                .filter((event) => event.tag_id)
                .map((event) => event.tag_id);

            const uniqueTagIds = [...new Set(tagIds)];

            const tagPromises = uniqueTagIds.map((tagId) =>
                axios.get(`/api/v2/calendar/tags/${tagId}`, {
                    headers: { Authorization: `Bearer ${token}` },
                })
            );

            try {
                const tagResponses = await Promise.all(tagPromises);
                const tagsData = tagResponses.reduce((acc, response) => {
                    acc[response.data.id] = response.data;
                    return acc;
                }, {});
                setTags(tagsData);
            } catch (error) {
                console.error("Error fetching tags:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchTags();
    }, [selectedDateEvents]);

    const sortedEvents = selectedDateEvents.sort((a, b) => {
        const startA = new Date(a.start_time);
        const startB = new Date(b.start_time);
        const endA = new Date(a.end_time || a.start_time);
        const endB = new Date(b.end_time || b.start_time);

        if (startA.getTime() === startB.getTime()) {
            return endA - endB;
        }
        return startA - startB;
    });

    const groupedEvents = sortedEvents.reduce((acc, event) => {
        const startHour = new Date(event.start_time).getHours();
        if (!acc[startHour]) {
            acc[startHour] = [];
        }
        acc[startHour].push(event);
        return acc;
    }, {});

    const handleEventDetail = (event) => {
        setSelectedEvent(event);
    };

    const handleCloseModal = () => {
        setSelectedEvent(null);
    };

    const handleAchieveEvent = async (eventId, recurrenceType) => {
        try {
            const token = localStorage.getItem("authToken");
            let url = `/api/v2/calendar/events/${eventId}`;
            switch (recurrenceType) {
                case "weekday":
                    url = `/api/v2/calendar/weekday-events/${eventId}`;
                    break;
                case "weekend":
                    url = `/api/v2/calendar/weekend-events/${eventId}`;
                    break;
                case "weekly":
                    url = `/api/v2/calendar/weekly-events/${eventId}`;
                    break;
                case "monthly":
                    url = `/api/v2/calendar/monthly-events/${eventId}`;
                    break;
                case "yearly":
                    url = `/api/v2/calendar/yearly-events/${eventId}`;
                    break;
                default:
                    break;
            }
            const event = selectedDateEvents.find((e) => e.id === eventId);
            console.log("Achieving event:", event);
            const authToken = getAuthToken(); // トークンを取得
            await axios.post(
                "/api/v2/achievements",
                {
                    user_id: event.user_id,
                    title: event.title,
                    start_time: event.start_time,
                    end_time: event.end_time,
                },
                {
                    headers: { Authorization: `Bearer ${authToken}` }, // トークンをヘッダーに追加
                }
            );
            await axios.delete(url, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            fetchEvents(); // イベントを再取得
            handleEventAchieved(eventId); // イベント達成時の関数を呼び出す
        } catch (error) {
            console.error("Error achieving event:", error);
        }
    };

    return (
        <div className="mt-2 p-2 bg-white border border-gray-300 rounded shadow-md w-full h-96 overflow-y-auto">
            {error && <div className="text-red-500 mb-2">{error}</div>}
            {isLoading ? (
                <div className="flex justify-center items-center h-full">
                    <div className="loader">データを取得中...</div>
                </div>
            ) : Object.keys(groupedEvents).length > 0 ? (
                <>
                    <div className="flex justify-between items-center mb-2">
                        <h2 className="text-lg font-bold">予定一覧</h2>
                        <button
                            className={`${
                                selectedEvents.length === 0
                                    ? "bg-gray-400 cursor-not-allowed"
                                    : "bg-red-500"
                            } text-white p-2 rounded shadow-md`}
                            onClick={handleDeleteSelectedEvents}
                            disabled={selectedEvents.length === 0}
                        >
                            選択した予定を削除
                        </button>
                    </div>
                    <ul>
                        {Object.keys(groupedEvents).map((startHour) => (
                            <React.Fragment key={startHour}>
                                <li className="text-gray-600 font-bold border-b border-gray-300 py-1 mb-2">
                                    {`${startHour}:00`}
                                </li>
                                {groupedEvents[startHour].map((event) => (
                                    <li
                                        key={event.id}
                                        className="mb-1 flex items-center justify-between"
                                    >
                                        <div className="flex items-center">
                                            <input
                                                type="checkbox"
                                                checked={selectedEvents.includes(
                                                    event.id
                                                )}
                                                onChange={() =>
                                                    handleEventSelect(event.id)
                                                }
                                                className="mr-2"
                                            />
                                            <span className="font-bold">
                                                {new Date(
                                                    event.start_time
                                                ).toLocaleTimeString("ja-JP", {
                                                    hour: "numeric",
                                                    minute: "2-digit",
                                                })}
                                                {" ~ "}
                                                {new Date(
                                                    event.end_time ||
                                                        event.start_time
                                                ).toLocaleTimeString("ja-JP", {
                                                    hour: "numeric",
                                                    minute: "2-digit",
                                                })}
                                            </span>
                                            {" 　"}
                                            <span className="font-bold">
                                                {event.title}
                                            </span>
                                            {event.tag_id &&
                                                tags[event.tag_id] && (
                                                    <div
                                                        className="ml-2 text-sm text-black px-2 py-1 rounded"
                                                        style={{
                                                            backgroundColor:
                                                                tags[
                                                                    event.tag_id
                                                                ].color ||
                                                                "#3b82f6", // デフォルトは青
                                                        }}
                                                    >
                                                        {
                                                            tags[event.tag_id]
                                                                .name
                                                        }
                                                    </div>
                                                )}
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <button
                                                className="text-blue-500 underline"
                                                onClick={() =>
                                                    handleEventDetail(event)
                                                }
                                            >
                                                詳細
                                            </button>
                                            <button
                                                className="bg-green-500 text-white p-1 rounded"
                                                onClick={() =>
                                                    handleAchieveEvent(
                                                        event.id,
                                                        event.recurrence_type
                                                    )
                                                }
                                            >
                                                達成
                                            </button>
                                        </div>
                                    </li>
                                ))}
                            </React.Fragment>
                        ))}
                    </ul>
                </>
            ) : (
                <>
                    <h2 className="text-lg font-bold mb-2">予定一覧</h2>
                    <p>登録されていません。</p>
                </>
            )}
            {selectedEvent && (
                <EventDetailModal
                    event={selectedEvent}
                    onEdit={() => {}}
                    onClose={handleCloseModal}
                />
            )}
        </div>
    );
}
