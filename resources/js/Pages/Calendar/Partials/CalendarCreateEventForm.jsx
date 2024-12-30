import { useState, useEffect } from "react";
import axios from "axios";

export default function CalendarCreateEventForm({
    onEventCreated,
    selectedDate,
}) {
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [startTime, setStartTime] = useState(selectedDate);
    const [endTime, setEndTime] = useState(selectedDate);
    const [isRecurring, setIsRecurring] = useState(false);
    const [recurrenceType, setRecurrenceType] = useState("none");
    const [allDay, setAllDay] = useState(false);
    const [allDayDate, setAllDayDate] = useState(selectedDate);
    const [notification, setNotification] = useState("none");
    const [location, setLocation] = useState("");
    const [link, setLink] = useState("");
    const [note, setNote] = useState("");
    const [tags, setTags] = useState([]);
    const [selectedTag, setSelectedTag] = useState(null);
    const [isTagListOpen, setIsTagListOpen] = useState(false);
    const [loadingTags, setLoadingTags] = useState(false);

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
            // デフォルトタグのみを設定
            setTags(defaultTags);
        } finally {
            setLoadingTags(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post("/api/v2/calendar/events", {
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
            });
            onEventCreated(response.data.event);
            setTitle("");
            setDescription("");
            setStartTime(selectedDate);
            setEndTime(selectedDate);
            setIsRecurring(false);
            setRecurrenceType("none");
            setAllDay(false);
            setAllDayDate(selectedDate);
            setNotification("none");
            setLocation("");
            setLink("");
            setNote("");
            setSelectedTag(null);
        } catch (error) {
            console.error("Error creating event:", error);
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
                        onChange={(e) => setIsRecurring(e.target.checked)}
                        className="align-middle"
                    />
                    {isRecurring && (
                        <select
                            value={recurrenceType}
                            onChange={(e) => setRecurrenceType(e.target.value)}
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
                                onChange={(e) => setAllDayDate(e.target.value)}
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
                            style={{ backgroundColor: selectedTag.color }}
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
                                                backgroundColor: tag.color,
                                            }}
                                        ></div>
                                        <button
                                            type="button"
                                            className="text-black underline"
                                            onClick={() => handleTagSelect(tag)}
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
            <button
                type="submit"
                className="bg-customPink text-white p-2 rounded shadow-md"
            >
                作成
            </button>
        </form>
    );
}
