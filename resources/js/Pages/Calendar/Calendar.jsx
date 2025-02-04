import HeaderSidebarLayout from "@/Layouts/HeaderSidebarLayout";
import { Head } from "@inertiajs/react";
import { useState, useEffect } from "react";
import axios from "axios";
import CreateEventForm from "./Partials/Forms/CreateEventForm";
import EditEventForm from "./Partials/Forms/EditEventForm";
import EventModal from "../../Components/EventModal"; // 修正されたインポートパス
import ChangeDateModal from "./Partials/Modals/ChangeDateModal";
import CalendarGrid from "./Partials/UI/CalendarGrid";
import TagSelectModal from "./Partials/Modals/TagSelectModal";
import DeleteEventModal from "./Partials/Modals/DeleteEventModal";
import SearchModal from "./Partials/Modals/SearchModal";
import EventList from "./Partials/UI/EventList";

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
    const [isLoading, setIsLoading] = useState(false);
    const [isTagSelectModalOpen, setIsTagSelectModalOpen] = useState(false); // 追加
    const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);

    useEffect(() => {
        fetchEvents();
    }, [currentDate, searchQuery, selectedTag]);

    // 認証トークンを取得する関数
    const getAuthToken = () => {
        const token = localStorage.getItem("authToken");
        if (!token) {
            console.error("Auth token is missing");
        }
        return token;
    };

    const fetchEvents = async () => {
        setIsLoading(true); // ローディング開始
        try {
            const authToken = getAuthToken(); // トークンを取得
            const [
                eventsResponse,
                weekdayResponse,
                weekendResponse,
                weeklyResponse,
                monthlyResponse,
                yearlyResponse,
            ] = await Promise.all([
                axios.get("/api/v2/calendar/events", {
                    params: { searchQuery, tagId: selectedTag },
                    headers: { Authorization: `Bearer ${authToken}` }, // トークンをヘッダーに追加
                }),
                axios.get("/api/v2/calendar/weekday-events", {
                    headers: { Authorization: `Bearer ${authToken}` }, // トークンをヘッダーに追加
                }),
                axios.get("/api/v2/calendar/weekend-events", {
                    headers: { Authorization: `Bearer ${authToken}` }, // トークンをヘッダーに追加
                }),
                axios.get("/api/v2/calendar/weekly-events", {
                    headers: { Authorization: `Bearer ${authToken}` }, // トークンをヘッダーに追加
                }),
                axios.get("/api/v2/calendar/monthly-events", {
                    headers: { Authorization: `Bearer ${authToken}` }, // トークンをヘッダーに追加
                }),
                axios.get("/api/v2/calendar/yearly-events", {
                    headers: { Authorization: `Bearer ${authToken}` }, // トークンをヘッダーに追加
                }),
            ]);

            const allEvents = [
                ...eventsResponse.data.events,
                ...weekdayResponse.data.events,
                ...weekendResponse.data.events,
                ...weeklyResponse.data.events,
                ...monthlyResponse.data.events,
                ...yearlyResponse.data.events,
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

    const handleSearch = async (query, tagQuery) => {
        try {
            const response = await axios.get("/api/v2/calendar/events", {
                params: { searchQuery: query, tagId: tagQuery },
            });
            return response.data.events;
        } catch (error) {
            console.error("Error searching events:", error);
            return [];
        }
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
        let hasWeekendEvent = false;
        let hasWeeklyEvent = false;
        let hasMonthlyEvent = false;
        let hasYearlyEvent = false;
        let hasNonWeekdayEvent = false;
        let hasNonWeekendEvent = false;
        let hasNonWeeklyEvent = false;
        let hasNonMonthlyEvent = false;
        let hasNonYearlyEvent = false;

        for (let i = 0; i < selectedEvents.length; i++) {
            const eventId = selectedEvents[i];
            const event = events.find((event) => event.id === eventId);

            if (event) {
                switch (event.recurrence_type) {
                    case "weekday":
                        hasWeekdayEvent = true;
                        break;
                    case "weekend":
                        hasWeekendEvent = true;
                        break;
                    case "weekly":
                        hasWeeklyEvent = true;
                        break;
                    case "monthly":
                        hasMonthlyEvent = true;
                        break;
                    case "yearly":
                        hasYearlyEvent = true;
                        break;
                    default:
                        hasNonWeekdayEvent = true;
                        break;
                }

                // 複数のタイプが見つかったら、早期にループを終了
                if (
                    (hasWeekdayEvent && hasNonWeekdayEvent) ||
                    (hasWeekendEvent && hasNonWeekendEvent) ||
                    (hasWeeklyEvent && hasNonWeeklyEvent) ||
                    (hasMonthlyEvent && hasNonMonthlyEvent) ||
                    (hasYearlyEvent && hasNonYearlyEvent)
                ) {
                    return true;
                }
            }
        }

        return (
            (hasWeekdayEvent && hasNonWeekdayEvent) ||
            (hasWeekendEvent && hasNonWeekdayEvent) ||
            (hasWeeklyEvent && hasNonWeekdayEvent) ||
            (hasMonthlyEvent && hasNonWeekdayEvent) ||
            (hasYearlyEvent && hasNonWeekdayEvent)
        );
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
            return "/img/seasons/spring-icon.png"; // 春
        } else if (month >= 6 && month <= 8) {
            return "/img/seasons/summer-icon.png"; // 夏
        } else if (month >= 9 && month <= 11) {
            return "/img/seasons/autumn-icon.png"; // 秋
        } else {
            return "/img/seasons/winter-icon.png"; // 冬
        }
    };

    const handleDateChange = (year, month) => {
        setCurrentDate(new Date(year, month - 1, 1));
        setSelectedDateEvents([]); // 日付変更時にリセット
    };

    return (
        <HeaderSidebarLayout>
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
                                    handleCreateEvent={handleCreateEvent}
                                    setIsSearchModalOpen={setIsSearchModalOpen}
                                    setIsTagSelectModalOpen={
                                        setIsTagSelectModalOpen
                                    }
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
            <EventModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
            >
                {selectedEvent ? (
                    <EditEventForm
                        event={selectedEvent}
                        onEventUpdated={handleEventUpdated}
                        onEventDeleted={handleEventDeleted}
                    />
                ) : (
                    <CreateEventForm
                        onEventCreated={handleEventCreated}
                        selectedDate={currentDate.toISOString().slice(0, 16)}
                    />
                )}
            </EventModal>
            <DeleteEventModal
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
            <ChangeDateModal
                isOpen={isDateModalOpen}
                onClose={() => setIsDateModalOpen(false)}
                onDateChange={handleDateChange}
            />
            <SearchModal
                isOpen={isSearchModalOpen}
                onClose={() => setIsSearchModalOpen(false)}
                handleSearch={handleSearch}
                handleDateClick={handleDateClick}
                setCurrentDate={setCurrentDate}
            />
            <TagSelectModal
                isOpen={isTagSelectModalOpen}
                onClose={() => setIsTagSelectModalOpen(false)}
                onTagSelected={handleTagSelected}
            />
        </HeaderSidebarLayout>
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
    handleCreateEvent,
    setIsSearchModalOpen,
    setIsTagSelectModalOpen,
}) {
    return (
        <div className="flex justify-between items-center">
            <div className="flex items-center space-x-1 max-sm:space-x-1">
                <button
                    className="bg-[#FFA742] text-white p-1 rounded-r-md max-sm:p-1 flex items-center"
                    onClick={() => setIsSearchModalOpen(true)} // 検索モーダルを開く
                >
                    <img
                        src="/img/icons/search-icon.png"
                        alt="検索"
                        className="w-4 h-4 mr-1"
                    />
                    検索
                </button>
                <button
                    className="bg-[#FFA742] text-white p-1 rounded-r-md max-sm:p-1 flex items-center"
                    onClick={() => setIsTagSelectModalOpen(true)} // タグ作成・削除モーダルを開く
                >
                    <img
                        src="/img/icons/tag-create-icon.png"
                        alt="タグ作成・削除"
                        className="w-4 h-4 mr-1"
                    />
                    タグ作成・削除
                </button>
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
