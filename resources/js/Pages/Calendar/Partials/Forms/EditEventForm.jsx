import { useState, useEffect } from "react";
import axios from "axios";
import EventModal from "../Modals/EventModal"; // モーダルコンポーネントのインポートパスを修正
import DeleteEventModal from "../Modals/DeleteEventModal"; // 追加

export default function EditEventForm({
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
    const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);

    useEffect(() => {
        fetchTags();
    }, []);

    const fetchTags = async () => {
        setLoadingTags(true);
        try {
            const response = await axios.get("/api/v2/calendar/tags");
            setTags(response.data.tags);
        } catch (error) {
            console.error("Error fetching tags:", error);
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
                    recurrence_days: recurrenceDays,
                    recurrence_dates: recurrenceDates,
                    recurrence_start_time: recurrenceStartTime,
                    recurrence_end_time: recurrenceEndTime,
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

    const handleDelete = async (deleteAll) => {
        try {
            if (deleteAll) {
                await axios.delete(
                    `/api/v2/calendar/events/${event.id}?delete_all=true`
                );
            } else {
                await axios.delete(`/api/v2/calendar/events/${event.id}`);
            }
            onEventDeleted(event.id);
            setShowDeleteConfirmation(false); // 確認メッセージを非表示にする
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
                                disabled={allDay || isRecurring}
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
                                disabled={allDay || isRecurring}
                            />
                        </div>
                    </div>
                    {isRecurring && (
                        <p className="text-gray-600">
                            繰り返し設定が有効な場合、開始時刻と終了時刻は変更できません。
                        </p>
                    )}
                    <div className="flex flex-col space-y-2">
                        <label className="font-bold">説明</label>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            className="p-2 border border-gray-300 rounded w-full"
                        />
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
                        {!showDeleteConfirmation && (
                            <button
                                type="button"
                                onClick={() => setShowDeleteConfirmation(true)}
                                className="bg-red-500 text-white p-2 rounded"
                            >
                                削除
                            </button>
                        )}
                    </div>
                    {showDeleteConfirmation && (
                        <DeleteEventModal
                            isOpen={showDeleteConfirmation}
                            onClose={() => setShowDeleteConfirmation(false)}
                            onDelete={handleDelete}
                            isRecurring={isRecurring}
                            recurrenceType={recurrenceType}
                        />
                    )}
                </div>
            )}
        </div>
    );
}
