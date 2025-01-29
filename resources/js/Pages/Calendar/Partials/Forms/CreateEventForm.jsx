import { useState, useEffect } from "react";
import axios from "axios";

export default function CreateEventForm({ onEventCreated, selectedDate }) {
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [startTime, setStartTime] = useState(
        new Date(selectedDate).toISOString().slice(0, 16)
    );
    const [endTime, setEndTime] = useState(
        new Date(selectedDate).toISOString().slice(0, 16)
    );
    const [isRecurring, setIsRecurring] = useState(false);
    const [recurrenceType, setRecurrenceType] = useState("none");
    const [allDay, setAllDay] = useState(false);
    const [allDayDate, setAllDayDate] = useState(selectedDate.split("T")[0]);
    const [notification, setNotification] = useState("none");
    const [location, setLocation] = useState("");
    const [link, setLink] = useState("");
    const [note, setNote] = useState("");
    const [tags, setTags] = useState([]);
    const [selectedTag, setSelectedTag] = useState(null);
    const [isTagListOpen, setIsTagListOpen] = useState(false);
    const [loadingTags, setLoadingTags] = useState(false);
    const [recurrenceDays, setRecurrenceDays] = useState([]);
    const [recurrenceDate, setRecurrenceDate] = useState("");

    useEffect(() => {
        fetchTags();
    }, []);

    const fetchTags = async () => {
        setLoadingTags(true);
        try {
            const response = await axios.get("/api/v2/calendar/tags");
            setTags(response.data.tags);
        } catch (error) {
            console.error("タグの取得中にエラーが発生しました:", error);
        } finally {
            setLoadingTags(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const eventStartTime = allDay ? `${allDayDate}T00:00` : startTime;
            const eventEndTime = allDay ? `${allDayDate}T23:59` : endTime;

            const recurrenceData = isRecurring
                ? {
                      recurrence_type: recurrenceType,
                      recurrence_days:
                          recurrenceType === "weekly" ? recurrenceDays : null,
                      recurrence_date: ["monthly", "yearly"].includes(
                          recurrenceType
                      )
                          ? recurrenceDate
                          : null,
                      recurrence_start_time: startTime
                          .split("T")[1]
                          .slice(0, 5),
                      recurrence_end_time: endTime.split("T")[1].slice(0, 5),
                  }
                : {
                      recurrence_type: "none",
                      recurrence_days: null,
                      recurrence_date: null,
                      recurrence_start_time: null,
                      recurrence_end_time: null,
                  };

            console.log("送信データ:", {
                title,
                description,
                start_time: eventStartTime,
                end_time: eventEndTime,
                is_recurring: isRecurring,
                ...recurrenceData,
                all_day: allDay,
                all_day_date: allDay ? allDayDate : null,
                notification,
                location,
                link,
                note,
                tag_id: selectedTag ? selectedTag.id : null,
            });

            const response = await axios.post("/api/v2/calendar/events", {
                title,
                description,
                start_time: eventStartTime,
                end_time: eventEndTime,
                is_recurring: isRecurring,
                ...recurrenceData,
                all_day: allDay,
                all_day_date: allDay ? allDayDate : null,
                notification,
                location,
                link,
                note,
                tag_id: selectedTag ? selectedTag.id : null,
            });

            console.log("作成されたイベント:", response.data.event);
            const eventId = response.data.event.id;

            if (isRecurring) {
                switch (recurrenceType) {
                    case "weekday":
                        await axios.post("/api/v2/calendar/weekday-events", {
                            event_id: eventId,
                            title,
                            description,
                            start_time: eventStartTime,
                            end_time: eventEndTime,
                            all_day: allDay,
                            location,
                            link,
                            notification,
                            recurrence_type: recurrenceType,
                        });
                        break;
                    case "weekend":
                        await axios.post("/api/v2/calendar/events", {
                            event_id: eventId,
                            title,
                            description,
                            start_time: eventStartTime,
                            end_time: eventEndTime,
                            all_day: allDay,
                            location,
                            link,
                            notification,
                        });
                        break;
                    case "weekly":
                        await axios.post("/api/v2/calendar/weekly_events", {
                            event_id: eventId,
                            recurrence_days: recurrenceDays,
                            title,
                            description,
                            start_time: eventStartTime,
                            end_time: eventEndTime,
                            all_day: allDay,
                            location,
                            link,
                            notification,
                        });
                        break;
                    case "monthly":
                        await axios.post("/api/v2/calendar/monthly_events", {
                            event_id: eventId,
                            recurrence_date: recurrenceDate,
                            title,
                            description,
                            start_time: eventStartTime,
                            end_time: eventEndTime,
                            all_day: allDay,
                            location,
                            link,
                            notification,
                        });
                        break;
                    case "yearly":
                        await axios.post("/api/v2/calendar/yearly_events", {
                            event_id: eventId,
                            recurrence_date: recurrenceDate,
                            title,
                            description,
                            start_time: eventStartTime,
                            end_time: eventEndTime,
                            all_day: allDay,
                            location,
                            link,
                            notification,
                        });
                        break;
                    default:
                        break;
                }
            }

            onEventCreated(response.data.event);
            setTitle("");
            setDescription("");
            setStartTime(new Date(selectedDate).toISOString().slice(0, 16));
            setEndTime(new Date(selectedDate).toISOString().slice(0, 16));
            setIsRecurring(false);
            setRecurrenceType("none");
            setAllDay(false);
            setAllDayDate(selectedDate.split("T")[0]);
            setNotification("none");
            setLocation("");
            setLink("");
            setNote("");
            setSelectedTag(null);
            setRecurrenceDays([]);
            setRecurrenceDate("");
        } catch (error) {
            console.error(
                "イベントの作成中にエラーが発生しました:",
                error.response?.data || error.message
            );
        }
    };

    const handleTagSelect = (tag) => {
        console.log("タグが選択されました:", tag);
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

    const isSubmitDisabled = () => {
        const start = new Date(startTime);
        const end = new Date(endTime);
        return end < start;
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
                            allDay ? "bg-gray-200 cursor-not-allowed" : ""
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
                            allDay ? "bg-gray-200 cursor-not-allowed" : ""
                        }`}
                        disabled={allDay}
                    />
                </div>
            </div>
            <div className="flex flex-col space-y-2">
                <label className="font-bold">
                    繰り返し設定
                    {allDay && (
                        <span className="text-gray-400 ml-2">
                            (現在選択できません)
                        </span>
                    )}
                </label>
                <div className="flex items-center space-x-4">
                    <input
                        type="checkbox"
                        checked={isRecurring}
                        onChange={(e) => {
                            setIsRecurring(e.target.checked);
                            if (e.target.checked) {
                                setAllDay(false);
                            }
                        }}
                        className="align-middle"
                        disabled={allDay}
                    />
                    <span className={allDay ? "text-gray-400" : ""}>
                        繰り返し設定
                    </span>
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
                {recurrenceType === "weekly" && (
                    <div className="flex flex-col space-y-2">
                        <label className="font-bold">曜日</label>
                        <div className="flex space-x-2">
                            {["日", "月", "火", "水", "木", "金", "土"].map(
                                (day, index) => (
                                    <label
                                        key={index}
                                        className="flex items-center space-x-1"
                                    >
                                        <input
                                            type="checkbox"
                                            value={index}
                                            checked={recurrenceDays.includes(
                                                index
                                            )}
                                            onChange={() =>
                                                handleRecurrenceDayChange(index)
                                            }
                                        />
                                        <span>{day}</span>
                                    </label>
                                )
                            )}
                        </div>
                        <label className="font-bold">開始時刻</label>
                        <input
                            type="time"
                            value={startTime.split("T")[1].slice(0, 5)}
                            onChange={(e) =>
                                setStartTime(
                                    `${startTime.split("T")[0]}T${
                                        e.target.value
                                    }`
                                )
                            }
                            className="p-2 border border-gray-300 rounded"
                        />
                        <label className="font-bold">終了時刻</label>
                        <input
                            type="time"
                            value={endTime.split("T")[1].slice(0, 5)}
                            onChange={(e) =>
                                setEndTime(
                                    `${endTime.split("T")[0]}T${e.target.value}`
                                )
                            }
                            className="p-2 border border-gray-300 rounded"
                        />
                    </div>
                )}
                {["weekday", "weekend"].includes(recurrenceType) && (
                    <div className="flex flex-col space-y-2">
                        <label className="font-bold">開始時刻</label>
                        <input
                            type="time"
                            value={startTime.split("T")[1].slice(0, 5)}
                            onChange={(e) =>
                                setStartTime(
                                    `${startTime.split("T")[0]}T${
                                        e.target.value
                                    }`
                                )
                            }
                            className="p-2 border border-gray-300 rounded"
                        />
                        <label className="font-bold">終了時刻</label>
                        <input
                            type="time"
                            value={endTime.split("T")[1].slice(0, 5)}
                            onChange={(e) =>
                                setEndTime(
                                    `${endTime.split("T")[0]}T${e.target.value}`
                                )
                            }
                            className="p-2 border border-gray-300 rounded"
                        />
                    </div>
                )}
                {["monthly", "yearly"].includes(recurrenceType) && (
                    <div className="flex flex-col space-y-2">
                        <label className="font-bold">日付</label>
                        <input
                            type="date"
                            value={recurrenceDate}
                            onChange={(e) => setRecurrenceDate(e.target.value)}
                            className="p-2 border border-gray-300 rounded"
                        />
                        <label className="font-bold">開始時刻</label>
                        <input
                            type="time"
                            value={startTime.split("T")[1].slice(0, 5)}
                            onChange={(e) =>
                                setStartTime(
                                    `${recurrenceDate}T${e.target.value}`
                                )
                            }
                            className="p-2 border border-gray-300 rounded"
                        />
                        <label className="font-bold">終了時刻</label>
                        <input
                            type="time"
                            value={endTime.split("T")[1].slice(0, 5)}
                            onChange={(e) =>
                                setEndTime(
                                    `${recurrenceDate}T${e.target.value}`
                                )
                            }
                            className="p-2 border border-gray-300 rounded"
                        />
                    </div>
                )}
            </div>
            <div className="flex flex-col space-y-2">
                <label className="font-bold">
                    終日設定
                    {isRecurring && (
                        <span className="text-gray-400 ml-2">
                            (現在選択できません)
                        </span>
                    )}
                </label>
                <div className="flex items-center space-x-4">
                    <input
                        type="checkbox"
                        checked={allDay}
                        onChange={(e) => {
                            setAllDay(e.target.checked);
                            if (e.target.checked) {
                                setIsRecurring(false);
                                setRecurrenceType("none");
                            }
                        }}
                        className="align-middle"
                        disabled={isRecurring}
                    />
                    <span className={isRecurring ? "text-gray-400" : ""}>
                        終日設定
                    </span>
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
                                        key={`tag-${tag.id}`}
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
                className={`bg-customPink text-white p-2 rounded shadow-md ${
                    isSubmitDisabled() ? "bg-gray-400 cursor-not-allowed" : ""
                }`}
                disabled={isSubmitDisabled()}
            >
                作成
            </button>
        </form>
    );
}
