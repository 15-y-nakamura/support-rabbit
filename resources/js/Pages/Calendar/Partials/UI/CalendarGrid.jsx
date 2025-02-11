import React, { useState, useEffect } from "react";
import axios from "axios";

const getAuthToken = () => {
    const token = localStorage.getItem("authToken");
    if (!token) {
        console.error("認証トークンが見つかりません。");
    }
    return token;
};

export default function CalendarGrid({ currentDate, events, handleDateClick }) {
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [userBirthday, setUserBirthday] = useState(null);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    useEffect(() => {
        const fetchUserBirthday = async () => {
            const token = getAuthToken();
            try {
                const response = await axios.get("/api/v2/profile", {
                    headers: { Authorization: `Bearer ${token}` },
                });
                const birthday = new Date(response.data.user.birthday);
                // UTCからJSTに変換
                const jstBirthday = new Date(
                    birthday.getTime() + 9 * 60 * 60 * 1000
                );
                setUserBirthday({
                    month: jstBirthday.getMonth() + 1,
                    day: jstBirthday.getDate(),
                });
            } catch (error) {
                console.error(
                    "ユーザー情報の取得中にエラーが発生しました:",
                    error
                );
            }
        };

        fetchUserBirthday();
    }, []);

    // currentDateが変更されたときにselectedDateを更新
    useEffect(() => {
        setSelectedDate(currentDate);
    }, [currentDate]);

    const isBirthday = (date) => {
        if (!userBirthday) return false;
        const dateJST = new Date(
            date.toLocaleString("en-US", { timeZone: "Asia/Tokyo" })
        );
        return (
            dateJST.getMonth() + 1 === userBirthday.month &&
            dateJST.getDate() === userBirthday.day
        );
    };

    // 現在の月の日数を取得
    const daysInMonth = new Date(
        currentDate.getFullYear(),
        currentDate.getMonth() + 1,
        0
    ).getDate();

    // 現在の月の最初の日の曜日インデックスを取得
    const firstDayIndex = new Date(
        currentDate.getFullYear(),
        currentDate.getMonth(),
        1
    ).getDay();

    // 現在の月の最後の日の曜日インデックスを取得
    const lastDayIndex = new Date(
        currentDate.getFullYear(),
        currentDate.getMonth(),
        daysInMonth
    ).getDay();

    // 前月の最後の日の日付を取得
    const prevLastDay = new Date(
        currentDate.getFullYear(),
        currentDate.getMonth(),
        0
    ).getDate();

    const days = [];

    // 前月の日付をカレンダーに追加
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

    // 現在の月の日付をカレンダーに追加
    for (let i = 1; i <= daysInMonth; i++) {
        const currentDay = new Date(
            currentDate.getFullYear(),
            currentDate.getMonth(),
            i
        );
        currentDay.setHours(0, 0, 0, 0);

        // 現在の日付に関連するイベントをフィルタリング
        const dayEvents = events.filter((event) => {
            const eventStart = new Date(event.start_time);
            const eventEnd = new Date(event.end_time || event.start_time);
            eventStart.setHours(0, 0, 0, 0);
            eventEnd.setHours(23, 59, 59, 999);
            return eventStart <= currentDay && eventEnd >= currentDay;
        });

        const isSelected =
            selectedDate && selectedDate.getTime() === currentDay.getTime();
        const isToday = today.getTime() === currentDay.getTime();
        const isBirthdayToday = isBirthday(currentDay);

        let borderClass = "";
        if (isSelected) {
            borderClass = "border-2 border-pink-500";
        } else if (isToday) {
            borderClass = "border-2 border-gray-500";
        }

        days.push(
            <div
                className={`calendar-day text-gray-800 font-bold bg-white hover:bg-gray-200 rounded-md flex flex-col justify-center items-center ${borderClass}`}
                key={`current-${currentDate.getMonth()}-${i}`}
                onClick={() => {
                    console.log(`Selected date: ${currentDay}`);
                    setSelectedDate(currentDay);
                    handleDateClick(currentDay);
                }}
                style={{
                    minHeight: "48px",
                    padding: "2px",
                    margin: "2px",
                    width: "calc(100% - 4px)",
                }}
            >
                <div className="text-sm flex items-center">
                    {i}
                    {isBirthdayToday && (
                        <img
                            src="/img/icons/birthday-icon.png"
                            alt="誕生日アイコン"
                            className="w-4 h-4 ml-1"
                        />
                    )}
                </div>
                {dayEvents.length > 0 && (
                    <img
                        src="/img/icons/event_icon.png"
                        alt="イベントあり"
                        className="w-4 h-4 mt-1"
                    />
                )}
            </div>
        );
    }

    // 次月の日付をカレンダーに追加
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
