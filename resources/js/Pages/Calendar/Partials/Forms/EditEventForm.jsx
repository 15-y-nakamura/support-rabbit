import { useState, useEffect } from "react";
import axios from "axios";
import InputError from "@/Components/InputError";

// 認証トークンを取得する関数
const getAuthToken = () => {
    const token = localStorage.getItem("authToken");
    if (!token) {
        console.error("認証トークンが見つかりません");
    }
    return token;
};

export default function EditEventForm({ event, onEventUpdated, onCancel }) {
    const formatDateTimeLocal = (dateString) => {
        const date = new Date(dateString);
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const day = String(date.getDate()).padStart(2, "0");
        const hours = String(date.getHours()).padStart(2, "0");
        const minutes = String(date.getMinutes()).padStart(2, "0");
        return `${year}-${month}-${day}T${hours}:${minutes}`;
    };

    const [title, setTitle] = useState(event.title || "");
    const [description, setDescription] = useState(event.description || "");
    const [startTime, setStartTime] = useState(
        formatDateTimeLocal(event.start_time || "")
    );
    const [endTime, setEndTime] = useState(
        formatDateTimeLocal(event.end_time || "")
    );
    const [isRecurring, setIsRecurring] = useState(event.is_recurring || false);
    const [recurrenceType, setRecurrenceType] = useState(
        event.recurrence_type || "none"
    );
    const [recurrenceDays, setRecurrenceDays] = useState(
        event.recurrence_days || []
    );
    const [recurrenceDates, setRecurrenceDates] = useState(
        event.recurrence_dates || []
    );
    const [recurrenceStartTime, setRecurrenceStartTime] = useState(
        event.recurrence_start_time || ""
    );
    const [recurrenceEndTime, setRecurrenceEndTime] = useState(
        event.recurrence_end_time || ""
    );
    const [allDay, setAllDay] = useState(event.all_day || false);
    const [allDayDate, setAllDayDate] = useState(
        event.start_time ? event.start_time.split("T")[0] : ""
    );
    const [location, setLocation] = useState(event.location || "");
    const [link, setLink] = useState(event.link || "");
    const [note, setNote] = useState(event.note || "");
    const [tags, setTags] = useState([]);
    const [selectedTag, setSelectedTag] = useState(null);
    const [isTagListOpen, setIsTagListOpen] = useState(false);
    const [loadingTags, setLoadingTags] = useState(false);
    const [errors, setErrors] = useState({});
    const [errorMessage, setErrorMessage] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showNotification, setShowNotification] = useState(false);

    useEffect(() => {
        fetchTags();
        if (event.tag_id) {
            fetchTag(event.tag_id);
        }
    }, [event.tag_id]);

    const fetchTags = async () => {
        setLoadingTags(true);
        try {
            const token = getAuthToken();
            const response = await axios.get("/api/v2/calendar/tags", {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            setTags(response.data.tags);
        } catch (error) {
            console.error("タグの取得中にエラーが発生しました:", error);
        } finally {
            setLoadingTags(false);
        }
    };

    const fetchTag = async (tagId) => {
        try {
            const token = getAuthToken();
            const response = await axios.get(`/api/v2/calendar/tags/${tagId}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            setSelectedTag(response.data);
        } catch (error) {
            console.error("イベントの達成処理中にエラーが発生しました:", error);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        const eventData = {
            event_id: event.id,
            title,
            start_time: startTime,
            end_time: endTime,
            is_recurring: isRecurring,
            recurrence_type: recurrenceType,
            recurrence_days: recurrenceDays,
            recurrence_dates: recurrenceDates,
            recurrence_start_time: recurrenceStartTime,
            recurrence_end_time: recurrenceEndTime,
            all_day: allDay,
            all_day_date: allDay ? allDayDate : null,
            location,
            link,
            note,
            tag_id: selectedTag ? selectedTag.id : null,
        };

        try {
            const token = getAuthToken();
            let response;
            switch (recurrenceType) {
                case "weekday":
                    response = await axios.put(
                        `/api/v2/calendar/weekday-events/${event.id}`,
                        eventData,
                        {
                            headers: {
                                Authorization: `Bearer ${token}`,
                            },
                        }
                    );
                    break;
                case "weekend":
                    response = await axios.put(
                        `/api/v2/calendar/weekend-events/${event.id}`,
                        eventData,
                        {
                            headers: {
                                Authorization: `Bearer ${token}`,
                            },
                        }
                    );
                    break;
                case "weekly":
                    response = await axios.put(
                        `/api/v2/calendar/weekly-events/${event.id}`,
                        eventData,
                        {
                            headers: {
                                Authorization: `Bearer ${token}`,
                            },
                        }
                    );
                    break;
                case "monthly":
                    response = await axios.put(
                        `/api/v2/calendar/monthly-events/${event.id}`,
                        eventData,
                        {
                            headers: {
                                Authorization: `Bearer ${token}`,
                            },
                        }
                    );
                    break;
                case "yearly":
                    response = await axios.put(
                        `/api/v2/calendar/yearly-events/${event.id}`,
                        eventData,
                        {
                            headers: {
                                Authorization: `Bearer ${token}`,
                            },
                        }
                    );
                    break;
                default:
                    response = await axios.put(
                        `/api/v2/calendar/events/${event.id}`,
                        eventData,
                        {
                            headers: {
                                Authorization: `Bearer ${token}`,
                            },
                        }
                    );
                    break;
            }
            setShowNotification(true);
            setTimeout(() => {
                window.location.href = "/user/calendar"; // カレンダー画面に戻る
            }, 3000); // 3秒後にリダイレクト
        } catch (error) {
            console.error("イベント更新中にエラーが発生しました。:", error);
            setErrorMessage("更新に失敗しました。");
            // エラーメッセージがある場合は、エラーの詳細を表示する
            if (
                error.response &&
                error.response.data &&
                error.response.data.errors
            ) {
                setErrors(error.response.data.errors);
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleTagSelect = (tag) => {
        setSelectedTag(tag);
        setIsTagListOpen(false);
    };

    const handleTagButtonClick = () => {
        setIsTagListOpen(!isTagListOpen);
    };

    const handleRecurrenceDayChange = (day) => {
        setRecurrenceDays((prevDays) =>
            prevDays.includes(day)
                ? prevDays.filter((d) => d !== day)
                : [...prevDays, day]
        );
    };

    const handleRecurrenceDateChange = (date) => {
        setRecurrenceDates((prevDates) =>
            prevDates.includes(date)
                ? prevDates.filter((d) => d !== date)
                : [...prevDates, date]
        );
    };

    const handleTimeChange = (type, value) => {
        const [hours, minutes] = value.split(":");
        const date = new Date(type === "start" ? startTime : endTime);
        date.setHours(hours);
        date.setMinutes(minutes);
        if (type === "start") {
            setStartTime(date.toISOString().slice(0, 16));
        } else {
            setEndTime(date.toISOString().slice(0, 16));
        }
    };

    const isRecurringEvent = [
        "weekday",
        "weekend",
        "weekly",
        "monthly",
        "yearly",
    ].includes(recurrenceType);

    return (
        <>
            <form
                onSubmit={handleSubmit}
                className="space-y-4 max-w-md mx-auto p-4 sm:max-w-2xl"
            >
                <div className="flex flex-col space-y-2">
                    <label className="font-bold">予定名</label>
                    <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        required
                        className="p-2 border border-gray-300 rounded w-full"
                    />
                    <InputError message={errors.title} className="mt-2" />
                </div>
                <hr className="my-4" />
                <div className="flex flex-col md:flex-row md:space-x-4">
                    <div className="flex flex-col flex-1 space-y-2">
                        <label className="font-bold">開始日時</label>
                        <input
                            type="datetime-local"
                            value={startTime}
                            onChange={(e) => setStartTime(e.target.value)}
                            required
                            className={`p-2 border border-gray-300 rounded w-full ${
                                allDay || isRecurringEvent ? "bg-gray-200" : ""
                            }`}
                            disabled={allDay || isRecurringEvent}
                        />
                        <InputError
                            message={errors.start_time}
                            className="mt-2"
                        />
                    </div>
                    <div className="flex flex-col flex-1 space-y-2 mt-4 md:mt-0">
                        <label className="font-bold">終了日時</label>
                        <input
                            type="datetime-local"
                            value={endTime}
                            onChange={(e) => setEndTime(e.target.value)}
                            className={`p-2 border border-gray-300 rounded w-full ${
                                allDay || isRecurringEvent ? "bg-gray-200" : ""
                            }`}
                            disabled={allDay || isRecurringEvent}
                        />
                        <InputError
                            message={errors.end_time}
                            className="mt-2"
                        />
                    </div>
                </div>
                {(allDay || isRecurringEvent) && (
                    <div className="flex flex-col md:flex-row md:space-x-4">
                        <div className="flex flex-col flex-1 space-y-2">
                            <label className="font-bold">開始時間</label>
                            <input
                                type="time"
                                value={new Date(startTime).toLocaleTimeString(
                                    "ja-JP",
                                    {
                                        hour: "2-digit",
                                        minute: "2-digit",
                                    }
                                )}
                                onChange={(e) =>
                                    handleTimeChange("start", e.target.value)
                                }
                                className="p-2 border border-gray-300 rounded w-full"
                            />
                            <InputError
                                message={errors.recurrence_start_time}
                                className="mt-2"
                            />
                        </div>
                        <div className="flex flex-col flex-1 space-y-2 mt-4 md:mt-0">
                            <label className="font-bold">終了時間</label>
                            <input
                                type="time"
                                value={new Date(endTime).toLocaleTimeString(
                                    "ja-JP",
                                    {
                                        hour: "2-digit",
                                        minute: "2-digit",
                                    }
                                )}
                                onChange={(e) =>
                                    handleTimeChange("end", e.target.value)
                                }
                                className="p-2 border border-gray-300 rounded w-full"
                            />
                            <InputError
                                message={errors.recurrence_end_time}
                                className="mt-2"
                            />
                        </div>
                    </div>
                )}
                <hr className="my-4" />
                <div className="flex flex-col space-y-2">
                    <label className="font-bold">場所</label>
                    <input
                        type="text"
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                        className="p-2 border border-gray-300 rounded w-full"
                    />
                    <InputError message={errors.location} className="mt-2" />
                </div>
                <div className="flex flex-col space-y-2">
                    <label className="font-bold">リンク</label>
                    <input
                        type="url"
                        value={link}
                        onChange={(e) => setLink(e.target.value)}
                        className="p-2 border border-gray-300 rounded w-full"
                    />
                    <InputError message={errors.link} className="mt-2" />
                </div>
                <div className="flex flex-col space-y-2">
                    <label className="font-bold">タグ</label>
                    {selectedTag ? (
                        <div className="mt-2 flex items-center space-x-2">
                            <div
                                className="p-2 border border-gray-300 rounded"
                                style={{
                                    backgroundColor: selectedTag.color,
                                }}
                            >
                                {selectedTag.name}
                            </div>
                            <button
                                type="button"
                                onClick={() => setSelectedTag(null)}
                                className="text-gray-600"
                            >
                                &times;
                            </button>
                        </div>
                    ) : (
                        <div className="mt-2 flex items-center space-x-2">
                            <span className="text-gray-700">
                                タグが選択されていません
                            </span>
                            <button
                                type="button"
                                onClick={handleTagButtonClick}
                                className="p-2 rounded shadow-md"
                            >
                                <img
                                    src="/img/icons/tag-icon.png"
                                    alt="タグを表示"
                                    className="w-6 h-6"
                                />
                            </button>
                        </div>
                    )}
                    {isTagListOpen && (
                        <div className="mt-2 p-2 border border-gray-300 rounded">
                            {loadingTags ? (
                                <div className="flex items-center justify-center">
                                    <div className="loader">
                                        タグを探しています...
                                    </div>
                                </div>
                            ) : (
                                <ul>
                                    {tags.length === 0 ? (
                                        <li className="text-gray-500">
                                            タグが作成されていません
                                        </li>
                                    ) : (
                                        tags.map((tag) => (
                                            <li
                                                key={`tag-${tag.id}`}
                                                className="flex items-center space-x-2"
                                            >
                                                <div
                                                    className="w-4 h-4 rounded"
                                                    style={{
                                                        backgroundColor:
                                                            tag.color,
                                                    }}
                                                ></div>
                                                <button
                                                    type="button"
                                                    className="text-black underline"
                                                    onClick={() =>
                                                        handleTagSelect(tag)
                                                    }
                                                >
                                                    {tag.name}
                                                </button>
                                            </li>
                                        ))
                                    )}
                                </ul>
                            )}
                        </div>
                    )}
                    <InputError message={errors.tag_id} className="mt-2" />
                </div>
                <div className="flex flex-col space-y-2">
                    <label className="font-bold">メモ</label>
                    <textarea
                        value={note}
                        onChange={(e) => setNote(e.target.value)}
                        className="p-2 border border-gray-300 rounded w-full"
                    />
                    <InputError message={errors.note} className="mt-2" />
                </div>
                <div className="flex justify-between mt-4">
                    <button
                        type="button"
                        onClick={onCancel}
                        className="bg-gray-500 hover:bg-gray-600 text-white p-2 rounded"
                    >
                        戻る
                    </button>
                    <button
                        type="submit"
                        className="bg-customBlue hover:bg-blue-400 text-white p-2 rounded flex items-center justify-center"
                    >
                        {isSubmitting ? (
                            <div className="flex items-center">
                                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                                保存中...
                            </div>
                        ) : (
                            "保存"
                        )}
                    </button>
                </div>
                {errorMessage && (
                    <div className="text-red-500 mt-2 text-right">
                        {errorMessage}
                    </div>
                )}
            </form>
            {showNotification && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-center z-50">
                    <div className="bg-white p-6 rounded shadow-lg relative max-w-md w-full">
                        <button
                            type="button"
                            onClick={() => {
                                setShowNotification(false);
                                window.location.href = "/user/calendar";
                            }}
                            className="absolute top-0 right-0 mt-2 mr-2 text-gray-600"
                        >
                            &times;
                        </button>
                        <div className="flex items-center">
                            <div className="bg-green-500 text-white p-4 rounded-full mr-4">
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="h-6 w-6"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2"
                                        d="M5 13l4 4L19 7"
                                    />
                                </svg>
                            </div>
                            <span className="text-green-500 font-bold">
                                イベントが更新されました！
                            </span>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
