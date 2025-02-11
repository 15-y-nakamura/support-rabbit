import React, { useState, useEffect } from "react";
import axios from "axios";
import EventDetailModal from "../Modals/EventDetailModal";

// 認証トークンを取得する関数
const getAuthToken = () => {
    const token = localStorage.getItem("authToken");
    if (!token) {
        console.error("認証トークンが見つかりません。");
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
    const [missingTags, setMissingTags] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

    const getFormattedDate = () => {
        if (selectedDateEvents.length > 0) {
            const date = new Date(selectedDateEvents[0].start_time);
            return date.toLocaleDateString("ja-JP", {
                year: "numeric",
                month: "long",
                day: "numeric",
                weekday: "long",
            });
        }
        return "";
    };

    useEffect(() => {
        const fetchTags = async () => {
            setIsLoading(true);
            const token = getAuthToken();
            const tagIds = selectedDateEvents
                .filter((event) => event.tag_id)
                .map((event) => event.tag_id);

            const uniqueTagIds = [...new Set(tagIds)];

            const tagPromises = uniqueTagIds.map((tagId) =>
                axios
                    .get(`/api/v2/calendar/tags/${tagId}`, {
                        headers: { Authorization: `Bearer ${token}` },
                    })
                    .catch((error) => {
                        if (error.response && error.response.status === 404) {
                            setMissingTags((prev) => [...prev, tagId]);
                        }
                    })
            );

            try {
                const tagResponses = await Promise.all(tagPromises);
                const tagsData = tagResponses.reduce((acc, response) => {
                    if (response) {
                        acc[response.data.id] = response.data;
                    }
                    return acc;
                }, {});
                setTags(tagsData);
            } catch (error) {
                console.error("タグの取得中にエラーが発生しました:", error);
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
            const authToken = getAuthToken();
            await axios.post(
                "/api/v2/achievements",
                {
                    user_id: event.user_id,
                    title: event.title,
                    start_time: event.start_time,
                    end_time: event.end_time,
                },
                {
                    headers: { Authorization: `Bearer ${authToken}` },
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
            console.error("イベントの達成処理中にエラーが発生しました:", error);
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
                        <span className="text-gray-600">
                            {getFormattedDate()}
                        </span>
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
                                {groupedEvents[startHour].map(
                                    (event, index) => (
                                        <li
                                            key={event.id || index}
                                            className="mb-1 flex items-center justify-between"
                                        >
                                            <div className="flex items-center">
                                                <input
                                                    type="checkbox"
                                                    checked={selectedEvents.some(
                                                        (selectedEvent) =>
                                                            selectedEvent.id ===
                                                                event.id &&
                                                            selectedEvent.type ===
                                                                event.recurrence_type
                                                    )}
                                                    onChange={(e) => {
                                                        const isChecked =
                                                            e.target.checked;
                                                        handleEventSelect({
                                                            id: event.id,
                                                            type: event.recurrence_type,
                                                        });
                                                        console.log(
                                                            `イベントID: ${event.id}, タイプ: ${event.recurrence_type}, チェックボックスの状態: ${isChecked}`
                                                        );
                                                    }}
                                                    className="mr-2"
                                                />
                                                <span className="font-bold">
                                                    {new Date(
                                                        event.start_time
                                                    ).toLocaleTimeString(
                                                        "ja-JP",
                                                        {
                                                            hour: "numeric",
                                                            minute: "2-digit",
                                                        }
                                                    )}
                                                    {" ~ "}
                                                    {new Date(
                                                        event.end_time ||
                                                            event.start_time
                                                    ).toLocaleTimeString(
                                                        "ja-JP",
                                                        {
                                                            hour: "numeric",
                                                            minute: "2-digit",
                                                        }
                                                    )}
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
                                                                        event
                                                                            .tag_id
                                                                    ].color ||
                                                                    "#3b82f6", // デフォルトは青
                                                            }}
                                                        >
                                                            {
                                                                tags[
                                                                    event.tag_id
                                                                ].name
                                                            }
                                                        </div>
                                                    )}
                                                {event.tag_id &&
                                                    missingTags.includes(
                                                        event.tag_id
                                                    ) && (
                                                        <span className="ml-2 text-sm text-gray-500">
                                                            (タグが削除されています)
                                                        </span>
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
                                    )
                                )}
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
