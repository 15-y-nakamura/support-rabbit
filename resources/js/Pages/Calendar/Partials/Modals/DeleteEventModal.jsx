import React, { useState, useEffect } from "react";
import axios from "axios";

export default function DeleteEventModal({
    isOpen,
    onClose,
    selectedEvents,
    events,
    handleEventDeleted,
    setSelectedEvents,
    setShowDeleteConfirmation,
}) {
    // 削除対象のイベントIDを保持するステート
    const [deleteAll, setDeleteAll] = useState({});
    // 関連イベントを保持するステート
    const [relatedEvents, setRelatedEvents] = useState({});
    // 関連イベントの表示状態を保持するステート
    const [showRelated, setShowRelated] = useState({});
    // 削除処理中かどうかを保持するステート
    const [isDeleting, setIsDeleting] = useState(false);

    // 認証トークンを取得する関数
    const getAuthToken = () => {
        const token = localStorage.getItem("authToken");
        if (!token) {
            console.error("認証トークンが見つかりません。");
        }
        return token;
    };

    // モーダルが開いたときに関連イベントを取得し、全てのチェックボックスにチェックを入れる
    useEffect(() => {
        if (isOpen) {
            fetchRelatedEvents();
        }
    }, [isOpen]);

    useEffect(() => {
        if (isOpen) {
            initializeDeleteAll();
        }
    }, [relatedEvents]);

    // 関連イベントを取得する関数
    const fetchRelatedEvents = async () => {
        const related = {};
        const token = getAuthToken();
        for (let i = 0; i < selectedEvents.length; i++) {
            const eventId = selectedEvents[i];
            const event = events.find((e) => e.id === eventId);
            if (event) {
                const [
                    weekdayResponse,
                    weekendResponse,
                    weeklyResponse,
                    monthlyResponse,
                    yearlyResponse,
                ] = await Promise.all([
                    axios.get(`/api/v2/calendar/weekday-events`, {
                        params: { event_id: event.event_id },
                        headers: { Authorization: `Bearer ${token}` },
                    }),
                    axios.get(`/api/v2/calendar/weekend-events`, {
                        params: { event_id: event.event_id },
                        headers: { Authorization: `Bearer ${token}` },
                    }),
                    axios.get(`/api/v2/calendar/weekly-events`, {
                        params: { event_id: event.event_id },
                        headers: { Authorization: `Bearer ${token}` },
                    }),
                    axios.get(`/api/v2/calendar/monthly-events`, {
                        params: { event_id: event.event_id },
                        headers: { Authorization: `Bearer ${token}` },
                    }),
                    axios.get(`/api/v2/calendar/yearly-events`, {
                        params: { event_id: event.event_id },
                        headers: { Authorization: `Bearer ${token}` },
                    }),
                ]);

                // レスポンスデータの形式を確認するためのログを追加
                console.log("weekdayResponse:", weekdayResponse.data);
                console.log("weekendResponse:", weekendResponse.data);
                console.log("weeklyResponse:", weeklyResponse.data);
                console.log("monthlyResponse:", monthlyResponse.data);
                console.log("yearlyResponse:", yearlyResponse.data);

                related[eventId] = [
                    ...weekdayResponse.data.events.filter(
                        (e) => e.event_id === event.event_id && e.id !== eventId
                    ),
                    ...weekendResponse.data.events.filter(
                        (e) => e.event_id === event.event_id && e.id !== eventId
                    ),
                    ...weeklyResponse.data.events.filter(
                        (e) => e.event_id === event.event_id && e.id !== eventId
                    ),
                    ...monthlyResponse.data.events.filter(
                        (e) => e.event_id === event.event_id && e.id !== eventId
                    ),
                    ...yearlyResponse.data.events.filter(
                        (e) => e.event_id === event.event_id && e.id !== eventId
                    ),
                ];
            }
        }
        setRelatedEvents(related);
    };

    // 全てのチェックボックスにチェックを入れる関数
    const initializeDeleteAll = () => {
        const initialDeleteAll = {};
        selectedEvents.forEach((eventId) => {
            initialDeleteAll[eventId] = true;
            if (relatedEvents[eventId]) {
                relatedEvents[eventId].forEach((relatedEvent) => {
                    initialDeleteAll[`related-${relatedEvent.id}`] = true;
                });
            }
        });
        setDeleteAll(initialDeleteAll);
    };

    if (!isOpen) return null;

    // イベントを削除する関数
    const deleteEvent = async (url) => {
        const token = getAuthToken();
        try {
            await axios.delete(url, {
                headers: { Authorization: `Bearer ${token}` },
            });
        } catch (error) {
            console.error("イベントの削除中にエラーが発生しました:", error);
        }
    };

    // 削除ボタンが押されたときの処理
    const handleDelete = async () => {
        setIsDeleting(true);
        const eventsToDelete = [...selectedEvents];

        for (let i = 0; i < selectedEvents.length; i++) {
            const eventId = selectedEvents[i];
            if (!deleteAll[eventId]) continue;

            const event = events.find((e) => e.id === eventId);
            let url;

            switch (event.recurrence_type) {
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
                    url = `/api/v2/calendar/events/${eventId}`;
                    break;
            }

            await deleteEvent(url);

            const relatedEventIds =
                relatedEvents[eventId]?.map((e) => e.id) || [];
            for (let j = 0; j < relatedEventIds.length; j++) {
                const relatedEventId = relatedEventIds[j];
                if (deleteAll[`related-${relatedEventId}`]) {
                    let relatedUrl;

                    switch (event.recurrence_type) {
                        case "weekday":
                            relatedUrl = `/api/v2/calendar/weekday-events/${relatedEventId}`;
                            break;
                        case "weekend":
                            relatedUrl = `/api/v2/calendar/weekend-events/${relatedEventId}`;
                            break;
                        case "weekly":
                            relatedUrl = `/api/v2/calendar/weekly-events/${relatedEventId}`;
                            break;
                        case "monthly":
                            relatedUrl = `/api/v2/calendar/monthly-events/${relatedEventId}`;
                            break;
                        case "yearly":
                            relatedUrl = `/api/v2/calendar/yearly-events/${relatedEventId}`;
                            break;
                        default:
                            relatedUrl = `/api/v2/calendar/events/${relatedEventId}`;
                            break;
                    }

                    await deleteEvent(relatedUrl);
                    eventsToDelete.push(relatedEventId);
                }
            }

            handleEventDeleted(eventId);
        }

        await deleteCalendarEvents(eventsToDelete);

        setSelectedEvents([]);
        setShowDeleteConfirmation(false);
        setIsDeleting(false);
        onClose();
    };

    // カレンダーイベントを削除する関数
    const deleteCalendarEvents = async (eventsToDelete) => {
        const token = getAuthToken();
        for (let i = 0; i < eventsToDelete.length; i++) {
            const eventId = eventsToDelete[i];
            const event = events.find((e) => e.id === eventId);
            if (!event) continue;

            // 関連するすべてのイベントを取得
            const [
                weekdayEvents,
                weekendEvents,
                weeklyEvents,
                monthlyEvents,
                yearlyEvents,
            ] = await Promise.all([
                axios.get(`/api/v2/calendar/weekday-events`, {
                    params: { event_id: event.event_id },
                    headers: { Authorization: `Bearer ${token}` },
                }),
                axios.get(`/api/v2/calendar/weekend-events`, {
                    params: { event_id: event.event_id },
                    headers: { Authorization: `Bearer ${token}` },
                }),
                axios.get(`/api/v2/calendar/weekly-events`, {
                    params: { event_id: event.event_id },
                    headers: { Authorization: `Bearer ${token}` },
                }),
                axios.get(`/api/v2/calendar/monthly-events`, {
                    params: { event_id: event.event_id },
                    headers: { Authorization: `Bearer ${token}` },
                }),
                axios.get(`/api/v2/calendar/yearly-events`, {
                    params: { event_id: event.event_id },
                    headers: { Authorization: `Bearer ${token}` },
                }),
            ]);

            // 取得したイベントを一つの配列にまとめる
            const remainingRelatedEvents = [
                ...weekdayEvents.data.events,
                ...weekendEvents.data.events,
                ...weeklyEvents.data.events,
                ...monthlyEvents.data.events,
                ...yearlyEvents.data.events,
            ];

            // 削除対象の関連イベントのIDを取得
            const selectedRelatedEventIds =
                relatedEvents[eventId]?.map((e) => e.id) || [];
            const allSelected =
                selectedRelatedEventIds.length > 0 &&
                selectedRelatedEventIds.every(
                    (id) => deleteAll[`related-${id}`]
                );

            // すべての関連イベントが選択されている場合、イベントを削除
            if (
                allSelected &&
                ["weekday", "weekend", "weekly", "monthly", "yearly"].includes(
                    event.recurrence_type
                )
            ) {
                console.log(
                    `calendar_eventsからイベントを削除します。ID: ${event.event_id}`
                );
                await deleteEvent(`/api/v2/calendar/events/${event.event_id}`);
            }
        }
    };

    // チェックボックスの状態を切り替える関数
    const handleCheckboxChange = function (eventId) {
        const newDeleteAll = { ...deleteAll };
        const isChecked = !deleteAll[eventId];
        newDeleteAll[eventId] = isChecked;

        // タイトル横のチェックボックスが外れた場合、関連イベントのチェックボックスも外す
        if (!isChecked) {
            relatedEvents[eventId]?.forEach((relatedEvent) => {
                newDeleteAll[`related-${relatedEvent.id}`] = false;
            });
            setShowRelated((prevShowRelated) => ({
                ...prevShowRelated,
                [eventId]: false,
            }));
        }

        setDeleteAll(newDeleteAll);
    };

    // 関連イベントの表示を切り替える関数
    const handleToggleRelated = function (eventId) {
        const newShowRelated = { ...showRelated };
        const newState = !showRelated[eventId];
        newShowRelated[eventId] = newState;
        setShowRelated(newShowRelated);

        // 関連イベントのチェックボックスの状態を更新
        const newDeleteAll = { ...deleteAll };
        if (newState) {
            // 関連イベントを表示する場合、関連イベントのチェックボックスをオンにする
            relatedEvents[eventId]?.forEach((relatedEvent) => {
                newDeleteAll[`related-${relatedEvent.id}`] = true;
            });
        } else {
            // 関連イベントを非表示にする場合、関連イベントのチェックボックスをオフにする
            relatedEvents[eventId]?.forEach((relatedEvent) => {
                newDeleteAll[`related-${relatedEvent.id}`] = false;
            });
        }
        setDeleteAll(newDeleteAll);
    };

    // 関連イベントをレンダリングする関数
    const renderRelatedEvents = function (eventId) {
        return relatedEvents[eventId]?.map((relatedEvent) => (
            <div
                key={relatedEvent.id}
                className="border p-2 mb-2 rounded shadow-md bg-gray-50"
            >
                <div className="flex justify-between items-center">
                    <div>
                        <p className="font-bold">{relatedEvent.title}</p>
                        <p className="text-sm text-gray-600">
                            {new Date(relatedEvent.start_time).toLocaleString(
                                "ja-JP",
                                {
                                    year: "numeric",
                                    month: "numeric",
                                    day: "numeric",
                                    hour: "2-digit",
                                    minute: "2-digit",
                                }
                            )}
                        </p>
                    </div>
                    <input
                        type="checkbox"
                        checked={
                            deleteAll[`related-${relatedEvent.id}`] || false
                        }
                        onChange={() =>
                            handleCheckboxChange(`related-${relatedEvent.id}`)
                        }
                        className="ml-2"
                    />
                </div>
            </div>
        ));
    };

    // イベントをレンダリングする関数
    const renderEvent = function (eventId) {
        const event = events.find((e) => e.id === eventId);
        if (!event) {
            console.error(`イベントID: ${eventId} が見つかりません`);
            return null;
        }

        const relatedEventCount = relatedEvents[eventId]?.length || 0;
        const hasRelatedEvents =
            event.recurrence_type !== "none" && relatedEventCount > 0;

        return (
            <div
                key={eventId}
                className="border p-2 mb-2 rounded shadow-md bg-cream"
            >
                <div className="flex justify-between items-center">
                    <div>
                        <p className="font-bold">{event.title}</p>
                        <p className="text-sm text-gray-600">
                            {new Date(event.start_time).toLocaleString(
                                "ja-JP",
                                {
                                    year: "numeric",
                                    month: "numeric",
                                    day: "numeric",
                                    hour: "2-digit",
                                    minute: "2-digit",
                                }
                            )}
                        </p>
                    </div>
                    <input
                        type="checkbox"
                        checked={deleteAll[eventId] || false}
                        onChange={() => handleCheckboxChange(eventId)}
                        className="ml-2"
                    />
                </div>
                {hasRelatedEvents && (
                    <div className="mt-4">
                        <label className="flex items-center">
                            <input
                                type="checkbox"
                                checked={showRelated[eventId] || false}
                                onChange={() => handleToggleRelated(eventId)}
                                className="mr-2"
                                disabled={!deleteAll[eventId]}
                            />
                            <span
                                className={`ml-2 ${
                                    !deleteAll[eventId] ? "text-gray-400" : ""
                                }`}
                            >
                                他のデータも削除
                            </span>
                        </label>
                        {showRelated[eventId] && (
                            <div className="mt-2 space-y-2">
                                {renderRelatedEvents(eventId)}
                            </div>
                        )}
                    </div>
                )}
            </div>
        );
    };

    // selectedEventsを時間の古い順にソートし、時間が同じ場合はIDの古い順にソート
    const sortedSelectedEvents = [...selectedEvents];
    for (let i = 0; i < sortedSelectedEvents.length - 1; i++) {
        for (let j = 0; j < sortedSelectedEvents.length - i - 1; j++) {
            const eventA = events.find((e) => e.id === sortedSelectedEvents[j]);
            const eventB = events.find(
                (e) => e.id === sortedSelectedEvents[j + 1]
            );
            const dateA = new Date(eventA.start_time);
            const dateB = new Date(eventB.start_time);

            if (
                dateA > dateB ||
                (dateA.getTime() === dateB.getTime() && eventA.id > eventB.id)
            ) {
                const temp = sortedSelectedEvents[j];
                sortedSelectedEvents[j] = sortedSelectedEvents[j + 1];
                sortedSelectedEvents[j + 1] = temp;
            }
        }
    }

    const isDeleteDisabled = !Object.values(deleteAll).some(
        (checked) => checked
    );

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
                    {isDeleting ? (
                        <div className="flex justify-center items-center">
                            <div className="w-16 h-16 border-8 border-gray-200 border-t-pink-400 rounded-full animate-spin"></div>
                        </div>
                    ) : (
                        <>
                            <p className="text-red-700 text-center">
                                選択されたデータを削除しますか？
                            </p>
                            <div className="mt-4 space-y-4">
                                {sortedSelectedEvents.map(renderEvent)}
                            </div>
                            <div className="flex justify-center mt-4">
                                <button
                                    type="button"
                                    onClick={handleDelete}
                                    className={`p-2 rounded ${
                                        isDeleteDisabled || isDeleting
                                            ? "bg-gray-400 cursor-not-allowed"
                                            : "bg-red-500 text-white"
                                    }`}
                                    disabled={isDeleteDisabled || isDeleting}
                                >
                                    削除
                                </button>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
