import React, { useEffect, useState } from "react";
import axios from "axios";

export default function CalendarGrid({ currentDate, events, handleDateClick }) {
    const [weekdayEvents, setWeekdayEvents] = useState([]);

    useEffect(() => {
        // weekday_events のデータを取得
        const fetchWeekdayEvents = async () => {
            try {
                const response = await axios.get(
                    "/api/v2/calendar/weekday-events"
                );
                setWeekdayEvents(response.data);
            } catch (error) {
                console.error("Error fetching weekday events:", error);
            }
        };

        fetchWeekdayEvents();
    }, []);

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

    for (let x = firstDayIndex; x > 0; x--) {
        days.push(
            <div
                className="calendar-day prev-month text-gray-400 flex justify-center items-center"
                key={`prev-${currentDate.getMonth()}-${x}`}
            >
                {prevLastDay - x + 1}
            </div>
        );
    }

    for (let i = 1; i <= daysInMonth; i++) {
        const currentDay = new Date(
            currentDate.getFullYear(),
            currentDate.getMonth(),
            i
        );

        // イベントデータのフィルタリングと表示
        const dayEvents = events.filter((event) => {
            const eventStart = new Date(event.start_time);
            const eventEnd = new Date(event.end_time || event.start_time);

            if (event.recurrence_type === "weekend") {
                return (
                    eventStart <= currentDay &&
                    currentDay <= eventEnd &&
                    (currentDay.getDay() === 0 || currentDay.getDay() === 6)
                );
            }

            if (event.recurrence_type === "weekly") {
                return (
                    eventStart <= currentDay &&
                    currentDay <= eventEnd &&
                    event.recurrence_days &&
                    event.recurrence_days.includes(currentDay.getDay())
                );
            }

            return (
                eventStart.toDateString() === currentDay.toDateString() ||
                eventEnd.toDateString() === currentDay.toDateString()
            );
        });

        // weekdayEvents からもイベントを追加
        const weekdayDayEvents = weekdayEvents.filter((event) => {
            const eventStart = new Date(event.start_time);
            const eventEnd = new Date(event.end_time || event.start_time);
            return (
                eventStart <= currentDay &&
                currentDay <= eventEnd &&
                currentDay.getDay() !== 0 &&
                currentDay.getDay() !== 6
            );
        });

        const allDayEvents = [...dayEvents, ...weekdayDayEvents];

        const markerColor =
            allDayEvents.length > 0 && allDayEvents[0].tag
                ? allDayEvents[0].tag.color
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
                {allDayEvents.map((event) => {
                    const eventColor = event.tag ? event.tag.color : "#F78FB3"; // デフォルトカラー
                    return (
                        <div
                            key={`${event.id}-${currentDate.getMonth()}-${i}`}
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
