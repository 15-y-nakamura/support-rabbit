import React from "react";

export default function CalendarEventList({
    selectedDateEvents,
    selectedEvents,
    handleEventSelect,
    handleDeleteSelectedEvents,
    handleEventDetail,
    handleEventComplete, // 新しいハンドラを追加
}) {
    // イベントをstart_timeが早い順にソートし、同じstart_timeのものはend_timeが早い順に並べる
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

    // 時間単位ごとにイベントをグループ化
    const groupedEvents = sortedEvents.reduce((acc, event) => {
        const startHour = new Date(event.start_time).getHours();
        if (!acc[startHour]) {
            acc[startHour] = [];
        }
        acc[startHour].push(event);
        return acc;
    }, {});

    return (
        <div className="mt-2 p-2 bg-white border border-gray-300 rounded shadow-md w-full h-96 overflow-y-auto">
            {Object.keys(groupedEvents).length > 0 ? (
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
                                            {event.title}
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
                                                    handleEventComplete(
                                                        event.id
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
        </div>
    );
}
