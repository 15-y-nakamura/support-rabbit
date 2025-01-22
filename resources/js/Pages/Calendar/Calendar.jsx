import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head } from "@inertiajs/react";
import { useState, useEffect } from "react";
import axios from "axios";
import CalendarCreateEventForm from "./Partials/CalendarCreateEventForm";
import CalendarEventDetailForm from "./Partials/CalendarEventDetailForm";
import CalendarTagSelectButton from "./Partials/CalendarTagSelectButton";
import CalendarModal from "./Partials/CalendarModal";
import DateChangeModal from "./Partials/DateChangeModal";
import CalendarGrid from "./Partials/CalendarGrid";
import CalendarDeleteConfirmationModal from "./Partials/CalendarDeleteConfirmationModal";

export default function Calendar() {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [events, setEvents] = useState([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedTag, setSelectedTag] = useState("");
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isDateModalOpen, setIsDateModalOpen] = useState(false);
    const [selectedDateEvents, setSelectedDateEvents] = useState([]);
    const [notification, setNotification] = useState(null);
    const [selectedEvents, setSelectedEvents] = useState([]);
    const [selectedEvent, setSelectedEvent] = useState(null);
    const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
    const [isLoading, setIsLoading] = useState(false); // ローディング状態を追加

    useEffect(() => {
        fetchEvents();
    }, [currentDate, searchQuery, selectedTag]);

    const fetchEvents = async () => {
        setIsLoading(true); // ローディング開始
        try {
            const [eventsResponse, weekdayResponse] = await Promise.all([
                axios.get("/api/v2/calendar/events", {
                    params: { searchQuery, tagId: selectedTag },
                }),
                fetch("/api/v2/calendar/weekday-events").then((res) =>
                    res.json()
                ),
            ]);

            const allEvents = [
                ...eventsResponse.data.events,
                ...weekdayResponse,
            ];
            setEvents(allEvents);

            // 現在選択されている日付のイベントをフィルタリングして設定
            const dayEvents = allEvents.filter((event) => {
                const eventStart = new Date(event.start_time);
                const eventEnd = new Date(event.end_time || event.start_time);
                eventStart.setHours(0, 0, 0, 0); // 時間部分をリセット
                eventEnd.setHours(23, 59, 59, 999); // 時間部分をリセット
                const selectedDate = new Date(currentDate);
                selectedDate.setHours(0, 0, 0, 0); // 時間部分をリセット

                return eventStart <= selectedDate && eventEnd >= selectedDate;
            });
            setSelectedDateEvents(dayEvents);
        } catch (error) {
            console.error("Error fetching events:", error);
        } finally {
            setIsLoading(false); // ローディング終了
        }
    };

    const handleEventCreated = (newEvent) => {
        fetchEvents(); // イベントを再取得
        setIsModalOpen(false);
        setNotification("イベントが正常に作成されました。");
    };

    const handleEventUpdated = (updatedEvent) => {
        fetchEvents(); // イベントを再取得
        setNotification("イベントが正常に更新されました。");
    };

    const handleEventDeleted = (deletedEventId) => {
        fetchEvents(); // イベントを再取得
        setNotification("イベントが正常に削除されました。");
    };

    const handleSearch = (query) => {
        setSearchQuery(query);
    };

    const handleTagSelected = (tagId) => {
        setSelectedTag(tagId);
    };

    const handleDateClick = (date) => {
        const dayEvents = events.filter((event) => {
            const eventStart = new Date(event.start_time);
            const eventEnd = new Date(event.end_time || event.start_time);
            eventStart.setHours(0, 0, 0, 0); // 時間部分をリセット
            eventEnd.setHours(23, 59, 59, 999); // 時間部分をリセット
            date.setHours(0, 0, 0, 0); // 時間部分をリセット

            return eventStart <= date && eventEnd >= date;
        });
        setSelectedDateEvents(dayEvents);
    };

    const handleEventSelect = (eventId) => {
        setSelectedEvents((prevSelected) =>
            prevSelected.includes(eventId)
                ? prevSelected.filter((id) => id !== eventId)
                : [...prevSelected, eventId]
        );
    };

    const handleDeleteSelectedEvents = () => {
        setShowDeleteConfirmation(true);
    };

    // 選択されたイベントが weekday イベントとそれ以外のイベントが混在しているかどうかを判定
    const isMixedSelection = (() => {
        let hasWeekdayEvent = false;
        let hasNonWeekdayEvent = false;

        for (let i = 0; i < selectedEvents.length; i++) {
            const eventId = selectedEvents[i];
            const event = events.find((event) => event.id === eventId);

            if (event) {
                if (event.recurrence_type === "weekday") {
                    hasWeekdayEvent = true;
                } else {
                    hasNonWeekdayEvent = true;
                }

                // 両方のタイプが見つかったら、早期にループを終了
                if (hasWeekdayEvent && hasNonWeekdayEvent) {
                    return true;
                }
            }
        }

        return hasWeekdayEvent && hasNonWeekdayEvent;
    })();

    const handleEventDetail = (event) => {
        setSelectedEvent(event);
        setIsModalOpen(true);
    };

    const handleCreateEvent = () => {
        setSelectedEvent(null);
        setIsModalOpen(true);
    };

    const handlePrevMonth = () => {
        setCurrentDate(
            new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1)
        );
        setSelectedDateEvents([]); // 他の月を選択したときにリセット
    };

    const handleNextMonth = () => {
        setCurrentDate(
            new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1)
        );
        setSelectedDateEvents([]); // 他の月を選択したときにリセット
    };

    const getSeasonIcon = () => {
        const month = currentDate.getMonth() + 1;
        if (month >= 3 && month <= 5) {
            return "/img/spring-icon.png"; // 春
        } else if (month >= 6 && month <= 8) {
            return "/img/summer-icon.png"; // 夏
        } else if (month >= 9 && month <= 11) {
            return "/img/autumn-icon.png"; // 秋
        } else {
            return "/img/winter-icon.png"; // 冬
        }
    };

    const handleDateChange = (year, month) => {
        setCurrentDate(new Date(year, month - 1, 1));
        setSelectedDateEvents([]); // 日付変更時にリセット
    };

    return (
        <AuthenticatedLayout>
            <Head title="カレンダー" />
            <div className="py-2 bg-cream min-h-screen">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="flex flex-col lg:flex-row">
                        <div className="w-full lg:w-1/3 mb-4 lg:mb-0">
                            <div className="bg-white shadow-md rounded-lg p-2">
                                <CalendarHeader
                                    currentDate={currentDate}
                                    handlePrevMonth={handlePrevMonth}
                                    handleNextMonth={handleNextMonth}
                                    setIsDateModalOpen={setIsDateModalOpen}
                                    getSeasonIcon={getSeasonIcon}
                                />
                                <CalendarDays />
                                <div
                                    className="grid grid-cols-7 gap-1 mt-2 bg-cream"
                                    style={{ minHeight: "300px" }}
                                >
                                    {isLoading ? (
                                        <div
                                            className="flex justify-center items-center col-span-7"
                                            style={{ height: "300px" }}
                                        >
                                            <div className="w-12 h-12 border-4 border-gray-200 border-t-pink-400 rounded-full animate-spin"></div>
                                        </div>
                                    ) : (
                                        <CalendarGrid
                                            currentDate={currentDate}
                                            events={events}
                                            handleDateClick={handleDateClick}
                                        />
                                    )}
                                </div>
                            </div>
                        </div>
                        <div className="w-full lg:w-2/3 pl-0 lg:pl-2">
                            <div
                                className="bg-white shadow-md rounded-lg p-2 h-full mb-4 w-full"
                                style={{
                                    width: "800px",
                                    height: "460px",
                                    maxWidth: "100%",
                                }}
                            >
                                <EventListHeader
                                    searchQuery={searchQuery}
                                    setSearchQuery={setSearchQuery}
                                    handleSearch={handleSearch}
                                    handleTagSelected={handleTagSelected}
                                    handleCreateEvent={handleCreateEvent}
                                />
                                <EventList
                                    selectedDateEvents={selectedDateEvents}
                                    selectedEvents={selectedEvents}
                                    handleEventSelect={handleEventSelect}
                                    handleDeleteSelectedEvents={
                                        handleDeleteSelectedEvents
                                    }
                                    handleEventDetail={handleEventDetail}
                                />
                            </div>
                        </div>
                    </div>
                    {notification && (
                        <div className="fixed bottom-4 right-4 bg-green-500 text-white p-4 rounded shadow-md">
                            {notification}
                        </div>
                    )}
                </div>
            </div>
            <CalendarModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
            >
                {selectedEvent ? (
                    <CalendarEventDetailForm
                        event={selectedEvent}
                        onEventUpdated={handleEventUpdated}
                        onEventDeleted={handleEventDeleted}
                    />
                ) : (
                    <CalendarCreateEventForm
                        onEventCreated={handleEventCreated}
                        selectedDate={currentDate.toISOString().slice(0, 16)}
                    />
                )}
            </CalendarModal>
            <CalendarDeleteConfirmationModal
                isOpen={showDeleteConfirmation}
                onClose={() => setShowDeleteConfirmation(false)}
                selectedEvents={selectedEvents}
                events={events}
                handleEventDeleted={handleEventDeleted}
                setSelectedEvents={setSelectedEvents}
                setShowDeleteConfirmation={setShowDeleteConfirmation}
                isMixedSelection={isMixedSelection}
                fetchEvents={fetchEvents} // fetchEvents関数を渡す
            />
            <DateChangeModal
                isOpen={isDateModalOpen}
                onClose={() => setIsDateModalOpen(false)}
                onDateChange={handleDateChange}
            />
        </AuthenticatedLayout>
    );
}

// カレンダーのヘッダー部分をコンポーネント化
function CalendarHeader({
    currentDate,
    handlePrevMonth,
    handleNextMonth,
    setIsDateModalOpen,
    getSeasonIcon,
}) {
    return (
        <div className="flex justify-between items-center w-full p-2 bg-cream rounded-lg mb-2">
            <button
                className="bg-pink-200 p-1 rounded-md text-white font-bold shadow-md max-sm:p-1"
                onClick={handlePrevMonth}
            >
                &lt;
            </button>
            <div className="flex items-center space-x-2">
                <div
                    className="text-lg font-bold text-pink-500 max-sm:text-md cursor-pointer"
                    onClick={() => setIsDateModalOpen(true)}
                >
                    {currentDate.toLocaleString("ja-JP", {
                        year: "numeric",
                        month: "long",
                    })}
                </div>
                <img
                    src={getSeasonIcon()}
                    alt="Season Icon"
                    className="h-6 w-6 max-sm:h-4 max-sm:w-4"
                />
            </div>
            <button
                className="bg-pink-200 p-1 rounded-md text-white font-bold shadow-md max-sm:p-1"
                onClick={handleNextMonth}
            >
                &gt;
            </button>
        </div>
    );
}

// カレンダーの日付部分をコンポーネント化
function CalendarDays() {
    return (
        <div className="grid grid-cols-7 gap-1 text-center text-pink-500 font-bold">
            <div>日</div>
            <div>月</div>
            <div>火</div>
            <div>水</div>
            <div>木</div>
            <div>金</div>
            <div>土</div>
        </div>
    );
}

// イベントリストのヘッダー部分をコンポーネント化
function EventListHeader({
    searchQuery,
    setSearchQuery,
    handleSearch,
    handleTagSelected,
    handleCreateEvent,
}) {
    return (
        <div className="flex justify-between items-center">
            <div className="flex items-center space-x-1 max-sm:space-x-1">
                <input
                    type="text"
                    placeholder="タグ検索"
                    className="w-48 p-1 border border-gray-300 rounded-l-md max-sm:w-32 max-sm:p-1"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
                <button
                    className="bg-[#FFA742] text-white p-1 rounded-r-md max-sm:p-1"
                    onClick={() => handleSearch(searchQuery)}
                >
                    検索
                </button>
                <CalendarTagSelectButton onTagSelected={handleTagSelected} />
            </div>
            <button
                className="bg-[#80ACCF] text-white p-1 rounded-full shadow-md max-sm:p-1"
                onClick={handleCreateEvent}
                style={{
                    width: "30px",
                    height: "30px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                }}
            >
                ＋
            </button>
        </div>
    );
}

// イベントリスト部分をコンポーネント化
function EventList({
    selectedDateEvents,
    selectedEvents,
    handleEventSelect,
    handleDeleteSelectedEvents,
    handleEventDetail,
}) {
    return (
        <div className="mt-2 p-2 bg-white border border-gray-300 rounded shadow-md w-full h-64">
            {selectedDateEvents.length > 0 ? (
                <>
                    <div className="flex justify-between items-center mb-2">
                        <h2 className="text-lg font-bold">予定一覧</h2>
                        <button
                            className={`${
                                selectedEvents.length === 0
                                    ? "bg-gray-400 cursor-not-allowed"
                                    : "bg-red-500"
                            } text-white p-2 rounded shadow-md`}
                            onClick={handleDeleteSelectedEvents}
                            disabled={selectedEvents.length === 0}
                        >
                            選択した予定を削除
                        </button>
                    </div>
                    <ul>
                        {selectedDateEvents.map((event) => (
                            <li
                                key={event.id}
                                className="mb-1 flex items-center justify-between"
                            >
                                <div className="flex items-center">
                                    <input
                                        type="checkbox"
                                        checked={selectedEvents.includes(
                                            event.id
                                        )}
                                        onChange={() =>
                                            handleEventSelect(event.id)
                                        }
                                        className="mr-2"
                                    />
                                    <span className="font-bold">
                                        {new Date(
                                            event.start_time
                                        ).toLocaleTimeString("ja-JP", {
                                            hour: "2-digit",
                                            minute: "2-digit",
                                        })}
                                        {" - "}
                                        {new Date(
                                            event.end_time || event.start_time
                                        ).toLocaleTimeString("ja-JP", {
                                            hour: "2-digit",
                                            minute: "2-digit",
                                        })}
                                    </span>{" "}
                                    - {event.title}
                                </div>
                                <div className="flex items-center space-x-2">
                                    <button
                                        className="text-blue-500 underline"
                                        onClick={() => handleEventDetail(event)}
                                    >
                                        詳細
                                    </button>
                                </div>
                            </li>
                        ))}
                    </ul>
                </>
            ) : (
                <>
                    <h2 className="text-lg font-bold mb-2">予定一覧</h2>
                    <p>登録されていません。</p>
                </>
            )}
        </div>
    );
}
