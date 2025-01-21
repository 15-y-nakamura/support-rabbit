import React from "react";

export default function CalendarGrid({ currentDate, events, handleDateClick }) {
    const daysInMonth = new Date(
        currentDate.getFullYear(),
        currentDate.getMonth() + 1,
        0
    ).getDate();
    const firstDayIndex = new Date(
        currentDate.getFullYear(),
        currentDate.getMonth(),
        1
    ).getDay();
    const lastDayIndex = new Date(
        currentDate.getFullYear(),
        currentDate.getMonth(),
        daysInMonth
    ).getDay();
    const prevLastDay = new Date(
        currentDate.getFullYear(),
        currentDate.getMonth(),
        0
    ).getDate();

    const days = [];

    // 前月の日付を表示
    for (let x = firstDayIndex; x > 0; x--) {
        days.push(
            <div
                className="calendar-day prev-month text-gray-400 flex justify-center items-center"
                key={`prev-${currentDate.getMonth()}-${x}-${
                    prevLastDay - x + 1
                }`}
            >
                {prevLastDay - x + 1}
            </div>
        );
    }

    // 現在の月の日付を表示
    for (let i = 1; i <= daysInMonth; i++) {
        const currentDay = new Date(
            currentDate.getFullYear(),
            currentDate.getMonth(),
            i
        );

        // 予定一覧のデータをそのまま表示
        const dayEvents = events.filter((event) => {
            const eventStart = new Date(event.start_time);
            const eventEnd = new Date(event.end_time || event.start_time);
            return (
                eventStart.toDateString() === currentDay.toDateString() ||
                eventEnd.toDateString() === currentDay.toDateString()
            );
        });

        const markerColor =
            dayEvents.length > 0 && dayEvents[0].tag
                ? dayEvents[0].tag.color
                : "#F78FB3"; // デフォルトカラー

        days.push(
            <div
                className="calendar-day text-gray-800 font-bold bg-white hover:bg-gray-200 rounded-md"
                key={`current-${currentDate.getMonth()}-${i}`}
                onClick={() => handleDateClick(currentDay)}
                style={{
                    minHeight: "48px", // 縦幅をさらに縮める
                    padding: "2px",
                    margin: "2px",
                    width: "calc(100% - 4px)",
                }}
            >
                <div className="text-sm">{i}</div>
                {dayEvents.map((event) => {
                    const eventColor = event.tag ? event.tag.color : "#F78FB3"; // デフォルトカラー
                    return (
                        <div
                            key={event.id}
                            className="text-xs rounded mt-1 px-1 truncate"
                            style={{ backgroundColor: eventColor }}
                        >
                            {event.title}
                        </div>
                    );
                })}
            </div>
        );
    }

    // 次月の日付を表示
    for (let j = 1; j <= 6 - lastDayIndex; j++) {
        days.push(
            <div
                className="calendar-day next-month text-gray-400 flex justify-center items-center"
                key={`next-${currentDate.getMonth()}-${j}`}
            >
                {j}
            </div>
        );
    }

    return days;
}
