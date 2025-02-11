import React, { useState, useEffect } from "react";
import HeaderSidebarLayout from "@/Layouts/HeaderSidebarLayout";
import { Head } from "@inertiajs/react";
import axios from "axios";
import CreateEventForm from "./Partials/Forms/CreateEventForm";
import EditEventForm from "./Partials/Forms/EditEventForm";
import EventModal from "../../Components/EventModal";
import ChangeDateModal from "./Partials/Modals/ChangeDateModal";
import CalendarGrid from "./Partials/UI/CalendarGrid";
import TagSelectModal from "./Partials/Modals/TagSelectModal";
import DeleteEventModal from "./Partials/Modals/DeleteEventModal";
import SearchModal from "./Partials/Modals/SearchModal";
import EventList from "./Partials/UI/EventList";
import ConfirmDeleteModal from "./Partials/Modals/ConfirmDeleteModal";

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
    const [isTagSelectModalOpen, setIsTagSelectModalOpen] = useState(false);
    const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

    useEffect(() => {
        fetchEvents();
    }, [currentDate, searchQuery, selectedTag]);

    // 認証トークンを取得する関数
    const getAuthToken = () => {
        const token = localStorage.getItem("authToken");
        if (!token) {
            console.error("認証トークンが見つかりません");
        }
        return token;
    };

    const fetchEvents = async () => {
        setIsLoading(true);
        try {
            const authToken = getAuthToken();
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
                    headers: { Authorization: `Bearer ${authToken}` },
                }),
                axios.get("/api/v2/calendar/weekday-events", {
                    headers: { Authorization: `Bearer ${authToken}` },
                }),
                axios.get("/api/v2/calendar/weekend-events", {
                    headers: { Authorization: `Bearer ${authToken}` },
                }),
                axios.get("/api/v2/calendar/weekly-events", {
                    headers: { Authorization: `Bearer ${authToken}` },
                }),
                axios.get("/api/v2/calendar/monthly-events", {
                    headers: { Authorization: `Bearer ${authToken}` },
                }),
                axios.get("/api/v2/calendar/yearly-events", {
                    headers: { Authorization: `Bearer ${authToken}` },
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
            console.error("イベントの取得中にエラーが発生しました:", error);
        } finally {
            setIsLoading(false);
        }
    };

    // 共通のイベントハンドラー関数
    const handleEventAction = (message) => {
        fetchEvents();
        setIsModalOpen(false);
        setNotification(message);
    };

    const handleEventCreated = () => {
        handleEventAction("イベントが作成されました。");
    };

    const handleEventDeleted = () => {
        handleEventAction("イベントが削除されました。");
    };

    const handleEventTagDeleted = () => {
        handleEventAction("タグが削除されました。");
    };

    const handleEventAchieved = () => {
        handleEventAction("イベントが達成されました。");
    };

    // 通知メッセージの表示時間を設定
    useEffect(() => {
        if (notification) {
            const timer = setTimeout(() => {
                setNotification("");
            }, 5000); // 5秒後に非表示にする

            return () => clearTimeout(timer);
        }
    }, [notification]);

    const handleSearch = async (query, tagQuery) => {
        try {
            const authToken = getAuthToken();
            const response = await axios.get("/api/v2/calendar/events", {
                params: { searchQuery: query, tagId: tagQuery },
                headers: { Authorization: `Bearer ${authToken}` },
            });
            return response.data.events;
        } catch (error) {
            console.error("イベントの検索中にエラーが発生しました:", error);
            return [];
        }
    };

    // タグが選択されたときに呼び出される関数
    const handleTagSelected = (tagId) => {
        setSelectedTag(tagId);
    };

    // 日付がクリックされたときに呼び出される関数
    const handleDateClick = (date) => {
        setSelectedDate(date);
        setSelectedEvents([]); // 他の日付を選択したときに現在選択されているデータを空にする

        // クリックされた日付に関連するイベントをフィルタリング
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

    // イベントが選択されたときに呼び出される関数
    const handleEventSelect = (event) => {
        setSelectedEvents((prevSelectedEvents) => {
            const isSelected = prevSelectedEvents.some(
                (selectedEvent) =>
                    selectedEvent.id === event.id &&
                    selectedEvent.type === event.type
            );
            if (isSelected) {
                return prevSelectedEvents.filter(
                    (selectedEvent) =>
                        selectedEvent.id !== event.id ||
                        selectedEvent.type !== event.type
                );
            } else {
                return [...prevSelectedEvents, event];
            }
        });
    };

    // 選択されたイベントを削除するための関数
    const handleDeleteSelectedEvents = () => {
        setShowDeleteConfirmation(true);
    };

    // 選択されたイベントが weekday イベントとそれ以外のイベントが混在しているかどうかを判定
    // これは、異なる種類の繰り返しイベントが混在している場合に、特定の処理を行うために使用されます。
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

        // 選択されたイベントをループして、各イベントの recurrence_type を確認
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

        // 最後に、混在しているかどうかを判定して返す
        return (
            (hasWeekdayEvent && hasNonWeekdayEvent) ||
            (hasWeekendEvent && hasNonWeekendEvent) ||
            (hasWeeklyEvent && hasNonWeeklyEvent) ||
            (hasMonthlyEvent && hasNonMonthlyEvent) ||
            (hasYearlyEvent && hasNonYearlyEvent)
        );
    })();

    // イベントの詳細を表示するための関数
    const handleEventDetail = (event) => {
        setSelectedEvent(event);
        setIsModalOpen(true);
    };

    // 新しいイベントを作成するための関数
    const handleCreateEvent = () => {
        setSelectedEvent(null);
        setIsModalOpen(true);
    };

    // 前の月を表示するための関数
    const handlePrevMonth = () => {
        setCurrentDate(
            new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1)
        );
        setSelectedDateEvents([]); // 他の月を選択したときにリセット
    };

    // 次の月を表示するための関数
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
                                    fetchEvents={fetchEvents}
                                    handleEventAchieved={handleEventAchieved}
                                />
                            </div>
                        </div>
                    </div>
                    <div>
                        {notification && (
                            <div className="fixed bottom-4 right-4 bg-green-500 text-white p-4 rounded shadow-md flex items-center">
                                <img
                                    src="/img/icons/rabbit-icon.png"
                                    alt="アイコン"
                                    className="w-6 h-6 mr-2"
                                />
                                {notification}
                            </div>
                        )}
                    </div>
                </div>
            </div>
            <EventModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
            >
                <CreateEventForm
                    onEventCreated={handleEventCreated}
                    selectedDate={selectedDate}
                />
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
                fetchEvents={fetchEvents}
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
            <ConfirmDeleteModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={handleEventTagDeleted}
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
                    className="bg-customOrange hover:bg-yellow-600 text-white p-1 rounded-r-md max-sm:p-1 flex items-center"
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
                    className="bg-customOrange hover:bg-yellow-600 text-white p-1 rounded-r-md max-sm:p-1 flex items-center"
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
                className="bg-customBlue hover:bg-blue-400 text-white p-1 rounded-full shadow-md max-sm:p-1"
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
