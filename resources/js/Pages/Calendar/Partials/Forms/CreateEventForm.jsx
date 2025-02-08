import { useState, useEffect } from "react";
import axios from "axios";
import InputError from "@/Components/InputError";

const getAuthToken = () => {
    const token = localStorage.getItem("authToken");
    if (!token) {
        console.error("認証トークンが見つかりません");
    }
    return token;
};

const getUserId = () => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (!user) {
        console.error("認証トークンが見つかりません");
    }
    return user ? user.id : null;
};

export default function CreateEventForm({ onEventCreated, selectedDate }) {
    const [title, setTitle] = useState("");

    const [startTime, setStartTime] = useState(
        `${
            new Date(
                selectedDate.getTime() -
                    selectedDate.getTimezoneOffset() * 60000
            )
                .toISOString()
                .split("T")[0]
        }T00:00`
    );
    const [endTime, setEndTime] = useState(
        `${
            new Date(
                selectedDate.getTime() -
                    selectedDate.getTimezoneOffset() * 60000
            )
                .toISOString()
                .split("T")[0]
        }T23:59`
    );
    const [isRecurring, setIsRecurring] = useState(false);
    const [recurrenceType, setRecurrenceType] = useState("none");
    const [allDay, setAllDay] = useState(false);
    const [allDayDate, setAllDayDate] = useState(
        `${
            new Date(
                selectedDate.getTime() -
                    selectedDate.getTimezoneOffset() * 60000
            )
                .toISOString()
                .split("T")[0]
        }`
    );
    const [location, setLocation] = useState("");
    const [link, setLink] = useState("");
    const [note, setNote] = useState("");
    const [tags, setTags] = useState([]);
    const [selectedTag, setSelectedTag] = useState(null);
    const [isTagListOpen, setIsTagListOpen] = useState(false);
    const [loadingTags, setLoadingTags] = useState(false);
    const [recurrenceDays, setRecurrenceDays] = useState([]);
    const [recurrenceDate, setRecurrenceDate] = useState("");
    const [errors, setErrors] = useState({});
    const [errorMessage, setErrorMessage] = useState("");

    useEffect(() => {
        fetchTags();
    }, []);

    const fetchTags = async () => {
        setLoadingTags(true);
        try {
            const authToken = getAuthToken();
            if (!authToken) {
                throw new Error("認証トークンが見つかりません");
            }
            const response = await axios.get("/api/v2/calendar/tags", {
                headers: {
                    Authorization: `Bearer ${authToken}`,
                },
            });
            setTags(response.data.tags);
        } catch (error) {
            console.error("タグの取得中にエラーが発生しました:");
        } finally {
            setLoadingTags(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrorMessage("");
        try {
            const authToken = getAuthToken();
            if (!authToken) {
                throw new Error("認証トークンが見つかりません");
            }
            const eventStartTime = allDay ? `${allDayDate}T00:00` : startTime;
            const eventEndTime = allDay ? `${allDayDate}T23:59` : endTime;

            const recurrenceData = isRecurring
                ? {
                      recurrence_type: recurrenceType,
                      recurrence_date: ["monthly", "yearly"].includes(
                          recurrenceType
                      )
                          ? recurrenceDate
                          : null,
                      recurrence_days: recurrenceDays,
                  }
                : {
                      recurrence_type: "none",
                      recurrence_date: null,
                      recurrence_days: [],
                  };

            const response = await axios.post(
                "/api/v2/calendar/events",
                {
                    title,
                    start_time: eventStartTime,
                    end_time: eventEndTime,
                    is_recurring: recurrenceType === "none" ? 0 : isRecurring,
                    ...recurrenceData,
                    all_day: allDay,
                    all_day_date: allDay ? allDayDate : null,
                    location,
                    link,
                    note,
                    tag_id: selectedTag ? selectedTag.id : null,
                },
                {
                    headers: {
                        Authorization: `Bearer ${authToken}`,
                    },
                }
            );

            const eventId = response.data.event.id;

            if (isRecurring) {
                switch (recurrenceType) {
                    case "weekday":
                        await axios.post(
                            "/api/v2/calendar/weekday-events",
                            {
                                event_id: eventId,
                                title,
                                note,
                                start_time: eventStartTime,
                                end_time: eventEndTime,
                                all_day: allDay,
                                location,
                                link,
                                recurrence_type: recurrenceType,
                                tag_id: selectedTag ? selectedTag.id : null,
                            },
                            {
                                headers: {
                                    Authorization: `Bearer ${authToken}`,
                                },
                            }
                        );
                        break;
                    case "weekend":
                        await axios.post(
                            "/api/v2/calendar/weekend-events",
                            {
                                event_id: eventId,
                                title,
                                note,
                                start_time: eventStartTime,
                                end_time: eventEndTime,
                                all_day: allDay,
                                location,
                                link,
                                recurrence_type: recurrenceType,
                                tag_id: selectedTag ? selectedTag.id : null,
                            },
                            {
                                headers: {
                                    Authorization: `Bearer ${authToken}`,
                                },
                            }
                        );
                        break;
                    case "weekly":
                        await axios.post(
                            "/api/v2/calendar/weekly-events",
                            {
                                event_id: eventId,
                                title,
                                note,
                                start_time: eventStartTime,
                                end_time: eventEndTime,
                                all_day: allDay,
                                location,
                                link,
                                recurrence_type: recurrenceType,
                                tag_id: selectedTag ? selectedTag.id : null,
                                recurrence_days: recurrenceDays,
                            },
                            {
                                headers: {
                                    Authorization: `Bearer ${authToken}`,
                                },
                            }
                        );
                        break;
                    case "monthly":
                        await axios.post(
                            "/api/v2/calendar/monthly-events",
                            {
                                event_id: eventId,
                                title,
                                note,
                                start_time: eventStartTime,
                                end_time: eventEndTime,
                                all_day: allDay,
                                location,
                                link,
                                recurrence_type: recurrenceType,
                                tag_id: selectedTag ? selectedTag.id : null,
                                recurrence_date: recurrenceDate,
                            },
                            {
                                headers: {
                                    Authorization: `Bearer ${authToken}`,
                                },
                            }
                        );
                        break;
                    case "yearly":
                        await axios.post(
                            "/api/v2/calendar/yearly-events",
                            {
                                event_id: eventId,
                                title,
                                note,
                                start_time: eventStartTime,
                                end_time: eventEndTime,
                                all_day: allDay,
                                location,
                                link,
                                recurrence_type: recurrenceType,
                                tag_id: selectedTag ? selectedTag.id : null,
                                recurrence_date: recurrenceDate,
                            },
                            {
                                headers: {
                                    Authorization: `Bearer ${authToken}`,
                                },
                            }
                        );
                        break;
                    default:
                        break;
                }
            }

            onEventCreated(response.data.event);
            setTitle("");
            setStartTime(new Date(selectedDate).toISOString().slice(0, 16));
            setEndTime(new Date(selectedDate).toISOString().slice(0, 16));
            setIsRecurring(false);
            setRecurrenceType("none");
            setAllDay(false);
            setAllDayDate(new Date(selectedDate).toISOString().split("T")[0]);
            setLocation("");
            setLink("");
            setNote("");
            setSelectedTag(null);
            setRecurrenceDate("");
            setRecurrenceDays([]);
        } catch (error) {
            console.error(
                "イベントの作成中にエラーが発生しました:",
                error.response?.data || error.message
            );
            console.log("エラー詳細:", error.response?.data.errors);
            setErrors(error.response?.data.errors || {});
            setErrorMessage("保存に失敗しました。");
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
                            allDay ? "bg-gray-200 cursor-not-allowed" : ""
                        }`}
                        disabled={allDay}
                    />
                    <InputError message={errors.start_time} className="mt-2" />
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
                    <InputError message={errors.end_time} className="mt-2" />
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
                            if (!e.target.checked) {
                                setRecurrenceType("none");
                                setRecurrenceDays([]);
                                setRecurrenceDate("");
                            }
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
                <InputError message={errors.recurrence_type} className="mt-2" />
                {isRecurring && recurrenceType === "weekly" && (
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
                        <InputError
                            message={errors.recurrence_days}
                            className="mt-2"
                        />
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
                        <InputError
                            message={errors.start_time}
                            className="mt-2"
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
                        <InputError
                            message={errors.end_time}
                            className="mt-2"
                        />
                    </div>
                )}
                {isRecurring &&
                    ["weekday", "weekend"].includes(recurrenceType) && (
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
                            <InputError
                                message={errors.start_time}
                                className="mt-2"
                            />
                            <label className="font-bold">終了時刻</label>
                            <input
                                type="time"
                                value={endTime.split("T")[1].slice(0, 5)}
                                onChange={(e) =>
                                    setEndTime(
                                        `${endTime.split("T")[0]}T${
                                            e.target.value
                                        }`
                                    )
                                }
                                className="p-2 border border-gray-300 rounded"
                            />
                            <InputError
                                message={errors.end_time}
                                className="mt-2"
                            />
                        </div>
                    )}
                {isRecurring &&
                    ["monthly", "yearly"].includes(recurrenceType) && (
                        <div className="flex flex-col space-y-2">
                            <label className="font-bold">日付</label>
                            {recurrenceType === "monthly" ? (
                                <div className="flex items-center space-x-2">
                                    <input
                                        type="number"
                                        placeholder="0"
                                        value={recurrenceDate}
                                        onChange={(e) =>
                                            setRecurrenceDate(e.target.value)
                                        }
                                        className="p-2 border border-gray-300 rounded"
                                        min="1"
                                        max="31"
                                    />
                                    <span>日</span>
                                </div>
                            ) : (
                                <input
                                    type="text"
                                    placeholder="月/日"
                                    value={recurrenceDate}
                                    onChange={(e) =>
                                        setRecurrenceDate(e.target.value)
                                    }
                                    className="p-2 border border-gray-300 rounded"
                                />
                            )}
                            <InputError
                                message={errors.recurrence_date}
                                className="mt-2"
                            />
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
                            <InputError
                                message={errors.start_time}
                                className="mt-2"
                            />
                            <label className="font-bold">終了時刻</label>
                            <input
                                type="time"
                                value={endTime.split("T")[1].slice(0, 5)}
                                onChange={(e) =>
                                    setEndTime(
                                        `${endTime.split("T")[0]}T${
                                            e.target.value
                                        }`
                                    )
                                }
                                className="p-2 border border-gray-300 rounded"
                            />
                            <InputError
                                message={errors.end_time}
                                className="mt-2"
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
                                setRecurrenceDays([]);
                                setRecurrenceDate("");
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
                                                    backgroundColor: tag.color,
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
            <button
                type="submit"
                className={`bg-customPink text-white p-2 rounded shadow-md ${
                    isSubmitDisabled() ? "bg-gray-400 cursor-not-allowed" : ""
                }`}
                disabled={isSubmitDisabled()}
            >
                作成
            </button>
            {errorMessage && (
                <div className="text-red-500 mt-2">{errorMessage}</div>
            )}
        </form>
    );
}
