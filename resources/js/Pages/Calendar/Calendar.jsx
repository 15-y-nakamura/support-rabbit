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

    useEffect(() => {
        fetchEvents();
    }, [currentDate, searchQuery, selectedTag]);

    const fetchEvents = async () => {
        try {
            const response = await axios.get("/api/v2/calendar/events", {
                params: { searchQuery, tagId: selectedTag },
            });
            setEvents(response.data.events);

            const weekdayResponse = await fetch(
                "/api/v2/calendar/weekday-events"
            );
            const weekdayData = await weekdayResponse.json();
            setEvents((prevEvents) => [...prevEvents, ...weekdayData]);
        } catch (error) {
            console.error("Error fetching events:", error);
        }
    };

    const handleEventCreated = (newEvent) => {
        setEvents([...events, newEvent]);
        setIsModalOpen(false);
        setNotification("イベントが正常に作成されました。");
    };

    const handleEventUpdated = (updatedEvent) => {
        setEvents(
            events.map((event) =>
                event.id === updatedEvent.id ? updatedEvent : event
            )
        );
        setNotification("イベントが正常に更新されました。");
    };

    const handleEventDeleted = (deletedEventId) => {
        setEvents(events.filter((event) => event.id !== deletedEventId));
        setSelectedDateEvents(
            selectedDateEvents.filter((event) => event.id !== deletedEventId)
        );
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
            return (
                eventStart.toDateString() === date.toDateString() ||
                eventEnd.toDateString() === date.toDateString()
            );
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

    const handleDeleteSelectedEvents = async () => {
        setShowDeleteConfirmation(true);
    };

    const handleDelete = async (deleteAll) => {
        try {
            await Promise.all(
                selectedEvents.map((eventId) => {
                    const event = events.find((e) => e.id === eventId);
                    const url =
                        event.recurrence_type === "weekday"
                            ? `/api/v2/calendar/weekday_events/${eventId}`
                            : `/api/v2/calendar/events/${eventId}`;
                    return axios.delete(
                        url + (deleteAll ? "?delete_all=true" : "")
                    );
                })
            );
            selectedEvents.forEach((eventId) => {
                handleEventDeleted(eventId);
            });
            setSelectedEvents([]);
            setShowDeleteConfirmation(false);
        } catch (error) {
            console.error("Error deleting events:", error);
        }
    };

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
    };

    const handleNextMonth = () => {
        setCurrentDate(
            new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1)
        );
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
    };

    return (
        <AuthenticatedLayout>
            <Head title="カレンダー" />
            <div className="py-2 bg-cream min-h-screen">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="flex flex-col lg:flex-row">
                        <div className="w-full lg:w-1/3 mb-4 lg:mb-0">
                            <div className="bg-white shadow-md rounded-lg p-2">
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
                                            onClick={() =>
                                                setIsDateModalOpen(true)
                                            }
                                        >
                                            {currentDate.toLocaleString(
                                                "ja-JP",
                                                {
                                                    year: "numeric",
                                                    month: "long",
                                                }
                                            )}
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
                                <div className="grid grid-cols-7 gap-1 text-center text-pink-500 font-bold">
                                    <div>日</div>
                                    <div>月</div>
                                    <div>火</div>
                                    <div>水</div>
                                    <div>木</div>
                                    <div>金</div>
                                    <div>土</div>
                                </div>
                                <div className="grid grid-cols-7 gap-1 mt-2 bg-cream">
                                    <CalendarGrid
                                        currentDate={currentDate}
                                        events={events}
                                        handleDateClick={handleDateClick}
                                    />
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
                                <div className="flex flex-col space-y-4">
                                    <div className="flex justify-between items-center">
                                        <div className="flex items-center space-x-1 max-sm:space-x-1">
                                            <input
                                                type="text"
                                                placeholder="タグ検索"
                                                className="w-48 p-1 border border-gray-300 rounded-l-md max-sm:w-32 max-sm:p-1"
                                                value={searchQuery}
                                                onChange={(e) =>
                                                    setSearchQuery(
                                                        e.target.value
                                                    )
                                                }
                                            />
                                            <button
                                                className="bg-[#FFA742] text-white p-1 rounded-r-md max-sm:p-1"
                                                onClick={() =>
                                                    handleSearch(searchQuery)
                                                }
                                            >
                                                検索
                                            </button>
                                            <CalendarTagSelectButton
                                                onTagSelected={
                                                    handleTagSelected
                                                }
                                            />
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
                                    <div className="mt-2 p-2 bg-white border border-gray-300 rounded shadow-md w-full h-64">
                                        {selectedDateEvents.length > 0 ? (
                                            <>
                                                <div className="flex justify-between items-center mb-2">
                                                    <h2 className="text-lg font-bold">
                                                        予定一覧
                                                    </h2>
                                                    <button
                                                        className="bg-red-500 text-white p-2 rounded shadow-md"
                                                        onClick={
                                                            handleDeleteSelectedEvents
                                                        }
                                                    >
                                                        選択した予定を削除
                                                    </button>
                                                </div>
                                                <ul>
                                                    {selectedDateEvents.map(
                                                        (event) => (
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
                                                                            handleEventSelect(
                                                                                event.id
                                                                            )
                                                                        }
                                                                        className="mr-2"
                                                                    />
                                                                    <span className="font-bold">
                                                                        {new Date(
                                                                            event.start_time
                                                                        ).toLocaleTimeString(
                                                                            "ja-JP",
                                                                            {
                                                                                hour: "2-digit",
                                                                                minute: "2-digit",
                                                                            }
                                                                        )}
                                                                        {" - "}
                                                                        {new Date(
                                                                            event.end_time ||
                                                                                event.start_time
                                                                        ).toLocaleTimeString(
                                                                            "ja-JP",
                                                                            {
                                                                                hour: "2-digit",
                                                                                minute: "2-digit",
                                                                            }
                                                                        )}
                                                                    </span>{" "}
                                                                    -{" "}
                                                                    {
                                                                        event.title
                                                                    }
                                                                </div>
                                                                <div className="flex items-center space-x-2">
                                                                    <button
                                                                        className="text-blue-500 underline"
                                                                        onClick={() =>
                                                                            handleEventDetail(
                                                                                event
                                                                            )
                                                                        }
                                                                    >
                                                                        詳細
                                                                    </button>
                                                                </div>
                                                            </li>
                                                        )
                                                    )}
                                                </ul>
                                            </>
                                        ) : (
                                            <>
                                                <h2 className="text-lg font-bold mb-2">
                                                    予定一覧
                                                </h2>
                                                <p>登録されていません。</p>
                                            </>
                                        )}
                                    </div>
                                </div>
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
            <CalendarModal
                isOpen={showDeleteConfirmation}
                onClose={() => setShowDeleteConfirmation(false)}
            >
                <div className="p-4">
                    <button
                        type="button"
                        onClick={() => setShowDeleteConfirmation(false)}
                        className="absolute top-0 right-0 mt-2 mr-2 text-gray-600"
                    >
                        &times;
                    </button>
                    <p className="text-red-700">
                        {selectedEvents.some(
                            (eventId) =>
                                events.find((event) => event.id === eventId)
                                    ?.recurrence_type
                        )
                            ? "このデータのみ削除しますか？それとも他の繰り返しデータも削除しますか？"
                            : "このデータを削除しますか？"}
                    </p>
                    <div className="flex justify-between mt-4">
                        <button
                            type="button"
                            onClick={() => handleDelete(false)}
                            className="bg-red-500 text-white p-2 rounded"
                        >
                            このデータのみ削除
                        </button>
                        <button
                            type="button"
                            onClick={() => handleDelete(true)}
                            className="bg-red-700 text-white p-2 rounded"
                        >
                            他のデータも削除
                        </button>
                    </div>
                </div>
            </CalendarModal>
            <DateChangeModal
                isOpen={isDateModalOpen}
                onClose={() => setIsDateModalOpen(false)}
                onDateChange={handleDateChange}
            />
        </AuthenticatedLayout>
    );
}
