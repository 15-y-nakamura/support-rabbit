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

    const defaultTags = [
        { id: 1, name: "お出かけ", color: "#FF0000" },
        { id: 2, name: "仕事", color: "#00FF00" },
        { id: 3, name: "勉強", color: "#0000FF" },
        { id: 4, name: "家事", color: "#FFFF00" },
        { id: 5, name: "健康", color: "#FF00FF" },
        { id: 6, name: "自由時間", color: "#00FFFF" },
    ];

    const fetchTags = async () => {
        try {
            const response = await axios.get("/api/v2/calendar/tags");
            setTags([...defaultTags, ...response.data.tags]);
        } catch (error) {
            console.error("Error fetching tags:", error);
            // デフォルトタグのみを設定
            setTags(defaultTags);
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
        if (!isTagListOpen) {
            fetchTags();
        }
        setIsTagListOpen(!isTagListOpen);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex flex-col">
                <label className="mb-1 font-bold">予定名</label>
                <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                    className="p-2 border border-gray-300 rounded"
                />
            </div>
            <div className="flex space-x-4">
                <div className="flex flex-col w-1/2">
                    <label className="mb-1 font-bold">開始日時</label>
                    <input
                        type="datetime-local"
                        value={startTime}
                        onChange={(e) => setStartTime(e.target.value)}
                        required
                        className={`p-2 border border-gray-300 rounded ${
                            allDay ? "bg-gray-200" : ""
                        }`}
                        disabled={allDay}
                    />
                </div>
                <div className="flex flex-col w-1/2">
                    <label className="mb-1 font-bold">終了日時</label>
                    <input
                        type="datetime-local"
                        value={endTime}
                        onChange={(e) => setEndTime(e.target.value)}
                        className={`p-2 border border-gray-300 rounded ${
                            allDay ? "bg-gray-200" : ""
                        }`}
                        disabled={allDay}
                    />
                </div>
            </div>
            <div className="flex items-center space-x-4">
                <label className="font-bold">繰り返し設定</label>
                <input
                    type="checkbox"
                    checked={isRecurring}
                    onChange={(e) => setIsRecurring(e.target.checked)}
                />
                {isRecurring && (
                    <select
                        value={recurrenceType}
                        onChange={(e) => setRecurrenceType(e.target.value)}
                        className="p-2 border border-gray-300 rounded w-40"
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
            <div className="flex items-center space-x-4">
                <label className="font-bold">終日設定</label>
                <input
                    type="checkbox"
                    checked={allDay}
                    onChange={(e) => setAllDay(e.target.checked)}
                />
                {allDay && (
                    <div className="flex flex-col">
                        <label className="mb-1 font-bold">日付</label>
                        <input
                            type="date"
                            value={allDayDate}
                            onChange={(e) => setAllDayDate(e.target.value)}
                            className="p-2 border border-gray-300 rounded"
                        />
                    </div>
                )}
            </div>
            <div className="flex flex-col">
                <label className="mb-1 font-bold">タグ</label>
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
                        <div className="p-2 border border-gray-300 rounded text-gray-700">
                            タグが選択されていません
                        </div>
                        <button
                            type="button"
                            onClick={handleTagButtonClick}
                            className="bg-customPink text-white p-2 rounded shadow-md"
                        >
                            タグを表示
                        </button>
                    </div>
                )}
                {isTagListOpen && (
                    <div className="mt-2 p-2 border border-gray-300 rounded">
                        <ul>
                            {tags.map((tag) => (
                                <li
                                    key={tag.id}
                                    className="flex items-center space-x-2"
                                >
                                    <div
                                        className="w-4 h-4 rounded"
                                        style={{ backgroundColor: tag.color }}
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
                    </div>
                )}
            </div>
            <div className="flex flex-col note">
                <label className="mb-1 font-bold">メモ</label>
                <textarea
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    className="p-2 border border-gray-300 rounded text"
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
