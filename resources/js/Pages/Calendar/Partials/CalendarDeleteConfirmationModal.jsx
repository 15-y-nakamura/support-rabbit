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
    // 削除対象のイベントIDを保持するステート
    const [deleteAll, setDeleteAll] = useState({});
    // 関連イベントを保持するステート
    const [relatedEvents, setRelatedEvents] = useState({});
    // 関連イベントの表示状態を保持するステート
    const [showRelated, setShowRelated] = useState({});
    // 削除処理中かどうかを保持するステート
    const [isDeleting, setIsDeleting] = useState(false);

    // モーダルが開いたときに関連イベントを取得し、全てのチェックボックスにチェックを入れる
    useEffect(() => {
        if (isOpen) {
            fetchRelatedEvents();
            initializeDeleteAll();
        }
    }, [isOpen]);

    // 関連イベントを取得する関数
    const fetchRelatedEvents = async () => {
        const related = {};
        for (let i = 0; i < selectedEvents.length; i++) {
            const eventId = selectedEvents[i];
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

    // 全てのチェックボックスにチェックを入れる関数
    const initializeDeleteAll = () => {
        const initialDeleteAll = {};
        selectedEvents.forEach((eventId) => {
            initialDeleteAll[eventId] = true;
            if (relatedEvents[eventId]) {
                relatedEvents[eventId].forEach((relatedEvent) => {
                    initialDeleteAll[relatedEvent.id] = true;
                });
            }
        });
        setDeleteAll(initialDeleteAll);
    };

    if (!isOpen) return null;

    // イベントを削除する関数
    const deleteEvent = async (url) => {
        try {
            await axios.delete(url);
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
            const url =
                event.recurrence_type === "weekday"
                    ? `/api/v2/calendar/weekday-events/${eventId}`
                    : `/api/v2/calendar/events/${eventId}`;
            await deleteEvent(url);

            const relatedEventIds =
                relatedEvents[eventId]?.map((e) => e.id) || [];
            for (let j = 0; j < relatedEventIds.length; j++) {
                const relatedEventId = relatedEventIds[j];
                if (deleteAll[relatedEventId]) {
                    await deleteEvent(
                        `/api/v2/calendar/weekday-events/${relatedEventId}`
                    );
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
        for (let i = 0; i < eventsToDelete.length; i++) {
            const eventId = eventsToDelete[i];
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
            const allSelected =
                selectedRelatedEventIds.length > 0 &&
                selectedRelatedEventIds.every((id) => deleteAll[id]);

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
    };

    // チェックボックスの状態を切り替える関数
    const handleCheckboxChange = function (eventId) {
        const newDeleteAll = { ...deleteAll };
        const isChecked = !deleteAll[eventId];
        newDeleteAll[eventId] = isChecked;
        setDeleteAll(newDeleteAll);

        // イベントのチェックが外れた場合、「他のデータも削除」のチェックも外し、関連イベントのチェックも外す
        if (!isChecked) {
            const newShowRelated = { ...showRelated };
            newShowRelated[eventId] = false;
            setShowRelated(newShowRelated);

            const relatedEventIds =
                relatedEvents[eventId]?.map((e) => e.id) || [];
            for (let i = 0; i < relatedEventIds.length; i++) {
                const id = relatedEventIds[i];
                newDeleteAll[id] = false;
            }
            setDeleteAll(newDeleteAll);
        }
    };

    // 関連イベントの表示を切り替える関数
    const handleToggleRelated = function (eventId) {
        const newShowRelated = { ...showRelated };
        const newState = !showRelated[eventId];
        newShowRelated[eventId] = newState;

        if (!newState) {
            // チェックが外れた場合、関連イベントのチェックも外す
            const relatedEventIds =
                relatedEvents[eventId]?.map((e) => e.id) || [];
            const newDeleteAll = { ...deleteAll };
            for (let i = 0; i < relatedEventIds.length; i++) {
                const id = relatedEventIds[i];
                newDeleteAll[id] = false;
            }
            setDeleteAll(newDeleteAll);
        }

        setShowRelated(newShowRelated);
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
                        checked={deleteAll[relatedEvent.id] || false}
                        onChange={() => handleCheckboxChange(relatedEvent.id)}
                        className="ml-2"
                    />
                </div>
            </div>
        ));
    };

    // イベントをレンダリングする関数
    const renderEvent = function (eventId) {
        const event = events.find((e) => e.id === eventId);
        if (!event) return null;

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
                        checked={deleteAll[eventId] || false}
                        onChange={() => handleCheckboxChange(eventId)}
                        className="ml-2"
                    />
                </div>
                {event.recurrence_type !== "none" && relatedEventCount > 0 && (
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
