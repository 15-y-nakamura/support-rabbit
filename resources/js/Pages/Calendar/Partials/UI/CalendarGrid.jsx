import React, { useState, useEffect } from "react";
import axios from "axios";

export default function CalendarGrid({ currentDate, events, handleDateClick }) {
    const [selectedDate, setSelectedDate] = useState(null);
    const [tags, setTags] = useState([]);
    const [calendarEvents, setCalendarEvents] = useState([]);
    const [weekdayEvents, setWeekdayEvents] = useState([]);

    useEffect(() => {
        fetchTags();
        fetchCalendarEvents();
        fetchWeekdayEvents();
    }, []);

    const fetchTags = async () => {
        try {
            const response = await axios.get("/api/v2/calendar/tags");
            setTags(response.data.tags);
            console.log("タグが取得されました:", response.data.tags);
        } catch (error) {
            console.error("タグの取得中にエラーが発生しました:", error);
        }
    };

    const fetchCalendarEvents = async () => {
        try {
            const response = await axios.get("/api/v2/calendar/events");
            setCalendarEvents(response.data.events);
            console.log(
                "カレンダーイベントが取得されました:",
                response.data.events
            );
        } catch (error) {
            console.error(
                "カレンダーイベントの取得中にエラーが発生しました:",
                error
            );
        }
    };

    const fetchWeekdayEvents = async () => {
        try {
            const response = await axios.get("/api/v2/calendar/weekday-events");
            setWeekdayEvents(response.data.events);
            console.log("平日イベントが取得されました:", response.data.events);
        } catch (error) {
            console.error("平日イベントの取得中にエラーが発生しました:", error);
        }
    };

    const getTagColor = (tagId) => {
        const tag = tags.find((tag) => tag.id === tagId);
        console.log(
            "タグの色を取得:",
            tagId,
            tag ? tag.color : "デフォルトカラー"
        );
        return tag ? tag.color : "#F78FB3"; // デフォルトカラー
    };

    const getEventTagColor = (event) => {
        if (event.tag_id) {
            console.log("イベントのタグID:", event.tag_id);
            return getTagColor(event.tag_id);
        } else if (event.event_id) {
            const calendarEvent = calendarEvents.find(
                (e) => e.id === event.event_id
            );
            console.log(
                "カレンダーイベントのタグID:",
                calendarEvent ? calendarEvent.tag_id : "なし"
            );
            return calendarEvent && calendarEvent.tag_id
                ? getTagColor(calendarEvent.tag_id)
                : "#F78FB3"; // デフォルトカラー
        } else {
            return "#F78FB3"; // デフォルトカラー
        }
    };

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
        currentDay.setHours(0, 0, 0, 0); // 時間部分をリセット

        // 予定一覧のデータをそのまま表示
        const dayEvents = events.filter((event) => {
            const eventStart = new Date(event.start_time);
            const eventEnd = new Date(event.end_time || event.start_time);
            eventStart.setHours(0, 0, 0, 0); // 時間部分をリセット
            eventEnd.setHours(23, 59, 59, 999); // 時間部分をリセット

            return eventStart <= currentDay && eventEnd >= currentDay;
        });

        console.log("日付:", currentDay, "のイベント:", dayEvents);

        // 選択された日付かどうかを判定
        const isSelected =
            selectedDate && selectedDate.getTime() === currentDay.getTime();

        days.push(
            <div
                className={`calendar-day text-gray-800 font-bold bg-white hover:bg-gray-200 rounded-md ${
                    isSelected ? "border-2 border-pink-500" : ""
                }`}
                key={`current-${currentDate.getMonth()}-${i}`}
                onClick={() => {
                    setSelectedDate(currentDay); // 選択された日付を状態に保存
                    handleDateClick(currentDay); // 親コンポーネントに日付を通知
                }}
                style={{
                    minHeight: "48px", // 縦幅をさらに縮める
                    padding: "2px",
                    margin: "2px",
                    width: "calc(100% - 4px)",
                }}
            >
                <div className="text-sm">{i}</div>
                {dayEvents.map((event) => {
                    const eventColor = getEventTagColor(event);
                    console.log("イベントの色:", event.title, eventColor);
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
