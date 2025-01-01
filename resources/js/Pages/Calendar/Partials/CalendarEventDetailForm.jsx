import { useState, useEffect } from "react";
import axios from "axios";

export default function CalendarEventDetailForm({
    event,
    onEventUpdated,
    onEventDeleted,
}) {
    const [title, setTitle] = useState(event.title || "");
    const [description, setDescription] = useState(event.description || "");
    const [startTime, setStartTime] = useState(event.start_time || "");
    const [endTime, setEndTime] = useState(event.end_time || "");
    const [isRecurring, setIsRecurring] = useState(event.is_recurring || false);
    const [recurrenceType, setRecurrenceType] = useState(
        event.recurrence_type || "none"
    );
    const [allDay, setAllDay] = useState(event.all_day || false);
    const [allDayDate, setAllDayDate] = useState(
        event.start_time ? event.start_time.split("T")[0] : ""
    );
    const [notification, setNotification] = useState(
        event.notification || "none"
    );
    const [location, setLocation] = useState(event.location || "");
    const [link, setLink] = useState(event.link || "");
    const [note, setNote] = useState(event.note || "");
    const [tags, setTags] = useState([]);
    const [selectedTag, setSelectedTag] = useState(event.tag || null);
    const [isTagListOpen, setIsTagListOpen] = useState(false);
    const [loadingTags, setLoadingTags] = useState(false);
    const [isEditing, setIsEditing] = useState(false);

    const defaultTags = [
        { id: 1, name: "お出かけ", color: "#FF0000" },
        { id: 2, name: "仕事", color: "#00FF00" },
        { id: 3, name: "勉強", color: "#0000FF" },
        { id: 4, name: "家事", color: "#FFFF00" },
        { id: 5, name: "健康", color: "#FF00FF" },
        { id: 6, name: "自由時間", color: "#00FFFF" },
    ];

    useEffect(() => {
        fetchTags();
    }, []);

    const fetchTags = async () => {
        setLoadingTags(true);
        try {
            const response = await axios.get("/api/v2/calendar/tags");
            setTags([...defaultTags, ...response.data.tags]);
        } catch (error) {
            console.error("Error fetching tags:", error);
            setTags(defaultTags); // デフォルトタグのみを設定
        } finally {
            setLoadingTags(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.put(
                `/api/v2/calendar/events/${event.id}`,
                {
                    title,
                    description,
                    start_time: startTime,
                    end_time: endTime,
                    is_recurring: isRecurring,
                    recurrence_type: recurrenceType,
                    all_day: allDay,
                    all_day_date: allDay ? allDayDate : null,
                    notification,
                    location,
                    link,
                    note,
                    tag_id: selectedTag ? selectedTag.id : null,
                }
            );
            onEventUpdated(response.data.event);
            setIsEditing(false);
        } catch (error) {
            console.error("Error updating event:", error);
        }
    };

    const handleDelete = async () => {
        try {
            await axios.delete(`/api/v2/calendar/events/${event.id}`);
            onEventDeleted(event.id);
        } catch (error) {
            console.error("Error deleting event:", error);
        }
    };

    const handleTagSelect = (tag) => {
        setSelectedTag(tag);
        setIsTagListOpen(false);
    };

    const handleTagButtonClick = () => {
        setIsTagListOpen(!isTagListOpen);
    };

    return (
        <div className="space-y-4 max-w-md mx-auto p-4 sm:max-w-2xl">
            {isEditing ? (
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="flex flex-col space-y-2">
                        <label className="font-bold">予定名</label>
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            required
                            className="p-2 border border-gray-300 rounded w-full"
                        />
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
                                    allDay ? "bg-gray-200" : ""
                                }`}
                                disabled={allDay}
                            />
                        </div>
                        <div className="flex flex-col flex-1 space-y-2">
                            <label className="font-bold">終了日時</label>
                            <input
                                type="datetime-local"
                                value={endTime}
                                onChange={(e) => setEndTime(e.target.value)}
                                className={`p-2 border border-gray-300 rounded w-full ${
                                    allDay ? "bg-gray-200" : ""
                                }`}
                                disabled={allDay}
                            />
                        </div>
                    </div>
                    <div className="flex flex-col space-y-2">
                        <label className="font-bold">繰り返し設定</label>
                        <div className="flex items-center space-x-4">
                            <input
                                type="checkbox"
                                checked={isRecurring}
                                onChange={(e) =>
                                    setIsRecurring(e.target.checked)
                                }
                                className="align-middle"
                            />
                            {isRecurring && (
                                <select
                                    value={recurrenceType}
                                    onChange={(e) =>
                                        setRecurrenceType(e.target.value)
                                    }
                                    className="p-2 border border-gray-300 rounded w-32"
                                >
                                    <option value="none">なし</option>
                                    <option value="weekday">平日</option>
                                    <option value="weekend">週末</option>
                                    <option value="weekly">毎週</option>
                                    <option value="monthly">毎月</option>
                                    <option value="yearly">毎年</option>
                                </select>
                            )}
                        </div>
                    </div>
                    <div className="flex flex-col space-y-2">
                        <label className="font-bold">終日設定</label>
                        <div className="flex items-center space-x-4">
                            <input
                                type="checkbox"
                                checked={allDay}
                                onChange={(e) => setAllDay(e.target.checked)}
                                className="align-middle"
                            />
                            {allDay && (
                                <div className="flex items-center space-x-4">
                                    <label className="font-bold">日付</label>
                                    <input
                                        type="date"
                                        value={allDayDate}
                                        onChange={(e) =>
                                            setAllDayDate(e.target.value)
                                        }
                                        className="p-2 border border-gray-300 rounded"
                                    />
                                </div>
                            )}
                        </div>
                    </div>
                    <div className="flex flex-col space-y-2">
                        <label className="font-bold">通知</label>
                        <select
                            value={notification}
                            onChange={(e) => setNotification(e.target.value)}
                            className="p-2 border border-gray-300 rounded w-32"
                        >
                            <option value="none">なし</option>
                            <option value="10minutes">10分前</option>
                            <option value="1hour">1時間前</option>
                        </select>
                    </div>
                    <hr className="my-4" />
                    <div className="flex flex-col space-y-2">
                        <label className="font-bold">場所</label>
                        <input
                            type="text"
                            value={location}
                            onChange={(e) => setLocation(e.target.value)}
                            className="p-2 border border-gray-300 rounded w-full"
                        />
                    </div>
                    <div className="flex flex-col space-y-2">
                        <label className="font-bold">リンク</label>
                        <input
                            type="url"
                            value={link}
                            onChange={(e) => setLink(e.target.value)}
                            className="p-2 border border-gray-300 rounded w-full"
                        />
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
                                        src="/img/tag-icon.png"
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
                                        <div className="loader">Loading...</div>
                                    </div>
                                ) : (
                                    <ul>
                                        {tags.map((tag) => (
                                            <li
                                                key={tag.id}
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
                                        ))}
                                    </ul>
                                )}
                            </div>
                        )}
                    </div>
                    <div className="flex flex-col space-y-2">
                        <label className="font-bold">メモ</label>
                        <textarea
                            value={note}
                            onChange={(e) => setNote(e.target.value)}
                            className="p-2 border border-gray-300 rounded w-full"
                        />
                    </div>
                    <div className="flex justify-between mt-4">
                        <button
                            type="submit"
                            className="bg-blue-500 text-white p-2 rounded"
                        >
                            保存
                        </button>
                        <button
                            type="button"
                            onClick={() => setIsEditing(false)}
                            className="bg-gray-500 text-white p-2 rounded"
                        >
                            戻る
                        </button>
                    </div>
                </form>
            ) : (
                <div className="space-y-4">
                    <div className="flex flex-col space-y-2">
                        <label className="font-bold">予定名</label>
                        <p className="p-2 border border-gray-300 rounded">
                            {title}
                        </p>
                    </div>
                    <hr className="my-4" />
                    <div className="flex flex-col md:flex-row md:space-x-4">
                        <div className="flex flex-col flex-1 space-y-2">
                            <label className="font-bold">開始日時</label>
                            <p className="p-2 border border-gray-300 rounded">
                                {new Date(startTime).toLocaleString()}
                            </p>
                        </div>
                        <div className="flex flex-col flex-1 space-y-2">
                            <label className="font-bold">終了日時</label>
                            <p className="p-2 border border-gray-300 rounded">
                                {new Date(endTime).toLocaleString()}
                            </p>
                        </div>
                    </div>
                    <div className="flex flex-col space-y-2">
                        <label className="font-bold">繰り返し設定</label>
                        <p className="p-2 border border-gray-300 rounded">
                            {recurrenceType !== "none"
                                ? recurrenceType
                                : "未設定"}
                        </p>
                    </div>
                    <div className="flex flex-col space-y-2">
                        <label className="font-bold">終日設定</label>
                        <p className="p-2 border border-gray-300 rounded">
                            {allDay ? "はい" : "未設定"}
                        </p>
                    </div>
                    <div className="flex flex-col space-y-2">
                        <label className="font-bold">通知</label>
                        <p className="p-2 border border-gray-300 rounded">
                            {notification !== "none" ? notification : "未設定"}
                        </p>
                    </div>
                    <hr className="my-4" />
                    <div className="flex flex-col space-y-2">
                        <label className="font-bold">場所</label>
                        <p className="p-2 border border-gray-300 rounded">
                            {location}
                        </p>
                    </div>
                    <div className="flex flex-col space-y-2">
                        <label className="font-bold">リンク</label>
                        <p className="p-2 border border-gray-300 rounded">
                            {link}
                        </p>
                    </div>
                    <div className="flex flex-col space-y-2">
                        <label className="font-bold">タグ</label>
                        {selectedTag ? (
                            <div
                                className="p-2 border border-gray-300 rounded"
                                style={{ backgroundColor: selectedTag.color }}
                            >
                                {selectedTag.name}
                            </div>
                        ) : (
                            <p className="p-2 border border-gray-300 rounded">
                                タグが選択されていません
                            </p>
                        )}
                    </div>
                    <div className="flex flex-col space-y-2">
                        <label className="font-bold">メモ</label>
                        <p className="p-2 border border-gray-300 rounded">
                            {note}
                        </p>
                    </div>
                    <div className="flex justify-between mt-4">
                        <button
                            type="button"
                            onClick={() => setIsEditing(true)}
                            className="bg-blue-500 text-white p-2 rounded"
                        >
                            編集
                        </button>
                        <button
                            type="button"
                            onClick={handleDelete}
                            className="bg-red-500 text-white p-2 rounded"
                        >
                            削除
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
