import React, { useState, useEffect } from "react";
import axios from "axios";

export default function CalendarDeleteConfirmationModal({
    isOpen,
    onClose,
    selectedEvents,
    events,
    handleEventDeleted,
    setSelectedEvents,
    setShowDeleteConfirmation,
}) {
    const [deleteAll, setDeleteAll] = useState({});
    const [relatedEvents, setRelatedEvents] = useState({});
    const [showRelated, setShowRelated] = useState({});
    const [isDeleting, setIsDeleting] = useState(false); // ローディング状態を追加

    useEffect(() => {
        if (isOpen) {
            fetchRelatedEvents();
        }
    }, [isOpen]);

    const fetchRelatedEvents = async () => {
        const related = {};
        for (const eventId of selectedEvents) {
            const event = events.find((e) => e.id === eventId);
            if (event) {
                const response = await axios.get(
                    `/api/v2/calendar/weekday-events`,
                    {
                        params: { event_id: event.event_id },
                    }
                );
                related[eventId] = response.data.filter(
                    (e) => e.event_id === event.event_id && e.id !== eventId
                );
            }
        }
        setRelatedEvents(related);
    };

    if (!isOpen) return null;

    const deleteEvent = async (url) => {
        try {
            await axios.delete(url);
        } catch (error) {
            console.error("イベントの削除中にエラーが発生しました:", error);
        }
    };

    const handleDelete = async () => {
        setIsDeleting(true); // ローディング開始
        const eventsToDelete = [...selectedEvents];

        for (const eventId of selectedEvents) {
            if (!deleteAll[eventId]) continue; // チェックが入っていないイベントは削除しない

            const event = events.find((e) => e.id === eventId);
            const url =
                event.recurrence_type === "weekday"
                    ? `/api/v2/calendar/weekday-events/${eventId}`
                    : `/api/v2/calendar/events/${eventId}`;
            await deleteEvent(url);

            // 関連するデータにチェックが入っている場合、そのデータも削除
            const relatedEventIds =
                relatedEvents[eventId]?.map((e) => e.id) || [];
            for (const relatedEventId of relatedEventIds) {
                if (deleteAll[relatedEventId]) {
                    await deleteEvent(
                        `/api/v2/calendar/weekday-events/${relatedEventId}`
                    );
                    eventsToDelete.push(relatedEventId);
                }
            }

            handleEventDeleted(eventId);
        }

        // 関連するweekday_eventが全て選択されている場合、calendar_eventsも削除
        for (const eventId of selectedEvents) {
            const event = events.find((e) => e.id === eventId);
            if (!event) continue;

            const remainingRelatedEvents = await axios.get(
                `/api/v2/calendar/weekday-events`,
                {
                    params: { event_id: event.event_id },
                }
            );

            const selectedRelatedEventIds =
                relatedEvents[eventId]?.map((e) => e.id) || [];
            const allSelected = selectedRelatedEventIds.every(
                (id) => deleteAll[id]
            );

            // コンソールログを追加
            console.log(`イベントID: ${eventId}`);
            console.log(`残っている関連イベント:`, remainingRelatedEvents.data);
            console.log(
                `残っている関連イベントの数: ${remainingRelatedEvents.data.length}`
            );
            console.log(`選択された関連イベントID:`, selectedRelatedEventIds);
            console.log(`全て選択されている: ${allSelected}`);

            if (allSelected) {
                console.log(
                    `calendar_eventsからイベントを削除します。ID: ${event.event_id}`
                );
                await deleteEvent(`/api/v2/calendar/events/${event.event_id}`);
            }
        }

        // 選択されたイベントのリセット
        setSelectedEvents([]);
        setShowDeleteConfirmation(false);
        setIsDeleting(false); // ローディング終了
        onClose(); // モーダルを閉じる
    };

    // チェックボックスの状態を切り替える関数
    const handleCheckboxChange = (eventId) => {
        setDeleteAll((prev) => ({
            ...prev,
            [eventId]: !prev[eventId], // 現在の状態を反転させる
        }));
    };

    // 関連イベントの表示を切り替える関数
    const handleToggleRelated = (eventId) => {
        setShowRelated((prev) => ({
            ...prev,
            [eventId]: !prev[eventId], // 現在の状態を反転させる
        }));
    };

    // 関連イベントをレンダリングする関数
    const renderRelatedEvents = (eventId) => {
        return relatedEvents[eventId]?.map((relatedEvent) => (
            <div
                key={relatedEvent.id}
                className="border p-2 mb-2 rounded shadow-md bg-cream"
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
                        checked={deleteAll[relatedEvent.id] || false} // チェックボックスの状態を設定
                        onChange={() => handleCheckboxChange(relatedEvent.id)} // チェックボックスの状態を切り替える
                        className="ml-2"
                    />
                </div>
            </div>
        ));
    };

    // イベントをレンダリングする関数
    const renderEvent = (eventId) => {
        const event = events.find((e) => e.id === eventId);
        if (!event) return null; // イベントが存在しない場合は何も表示しない
        const relatedEventCount = relatedEvents[eventId]?.length || 0;
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
                        checked={deleteAll[eventId] || false} // チェックボックスの状態を設定
                        onChange={() => handleCheckboxChange(eventId)} // チェックボックスの状態を切り替える
                        className="ml-2"
                    />
                </div>
                {event.recurrence_type !== "none" && relatedEventCount > 0 && (
                    <div className="mt-2">
                        <label className="flex items-center">
                            <input
                                type="checkbox"
                                checked={showRelated[eventId] || false} // 他のデータも削除のチェックボックスの状態を設定
                                onChange={() => handleToggleRelated(eventId)} // 他のデータも削除のチェックボックスの状態を切り替える
                                className="mr-2"
                            />
                            <span className="ml-2">他のデータも削除</span>
                        </label>
                        {showRelated[eventId] && renderRelatedEvents(eventId)}
                    </div>
                )}
            </div>
        );
    };

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
                            <div className="mt-4 space-y-2">
                                {selectedEvents.map(renderEvent)}
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
