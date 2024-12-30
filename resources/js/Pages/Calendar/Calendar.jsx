import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head } from "@inertiajs/react";
import { useState, useEffect } from "react";
import axios from "axios";
import CalendarCreateEventForm from "./Partials/CalendarCreateEventForm";
import CalendarUpdateEventForm from "./Partials/CalendarUpdateEventForm";
import CalendarDeleteEventButton from "./Partials/CalendarDeleteEventButton";
import CalendarTagSelectButton from "./Partials/CalendarTagSelectButton";
import CalendarModal from "./Partials/CalendarModal";
import DateChangeModal from "./Partials/DateChangeModal";

export default function Calendar() {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [events, setEvents] = useState([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedTag, setSelectedTag] = useState("");
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isDateModalOpen, setIsDateModalOpen] = useState(false);

    useEffect(() => {
        fetchEvents();
    }, [currentDate, searchQuery, selectedTag]);

    const fetchEvents = async () => {
        try {
            const response = await axios.get("/api/v2/calendar/events", {
                params: { searchQuery, tagId: selectedTag },
            });
            setEvents(response.data.events);
        } catch (error) {
            console.error("Error fetching events:", error);
        }
    };

    const handleEventCreated = (newEvent) => {
        setEvents([...events, newEvent]);
        setIsModalOpen(false); // モーダルを閉じる
    };

    const handleEventUpdated = (updatedEvent) => {
        setEvents(
            events.map((event) =>
                event.id === updatedEvent.id ? updatedEvent : event
            )
        );
    };

    const handleEventDeleted = (deletedEventId) => {
        setEvents(events.filter((event) => event.id !== deletedEventId));
    };

    const handleSearch = (query) => {
        setSearchQuery(query);
    };

    const handleTagSelected = (tagId) => {
        setSelectedTag(tagId);
    };

    const renderCalendar = () => {
        const daysInMonth = new Date(
            currentDate.getFullYear(),
            currentDate.getMonth() + 1,
            0
        ).getDate();
        const firstDayIndex = new Date(
            currentDate.getFullYear(),
            currentDate.getMonth(),
            1
        ).getDay();
        const lastDayIndex = new Date(
            currentDate.getFullYear(),
            currentDate.getMonth(),
            daysInMonth
        ).getDay();
        const prevLastDay = new Date(
            currentDate.getFullYear(),
            currentDate.getMonth(),
            0
        ).getDate();

        const days = [];

        for (let x = firstDayIndex; x > 0; x--) {
            days.push(
                <div
                    className="calendar-day prev-month text-gray-400"
                    key={`prev-${x}`}
                >
                    {prevLastDay - x + 1}
                </div>
            );
        }

        for (let i = 1; i <= daysInMonth; i++) {
            const dayEvents = events.filter(
                (event) => new Date(event.start_time).getDate() === i
            );
            days.push(
                <div
                    className="calendar-day text-gray-800 font-bold bg-pink-50 hover:bg-pink-200 rounded-md"
                    key={`current-${i}`}
                >
                    {i}
                    {dayEvents.map((event) => (
                        <div
                            key={event.id}
                            className="event bg-blue-200 p-1 mt-1 rounded"
                        >
                            {event.title}
                            <CalendarUpdateEventForm
                                event={event}
                                onEventUpdated={handleEventUpdated}
                            />
                            <CalendarDeleteEventButton
                                eventId={event.id}
                                onEventDeleted={handleEventDeleted}
                            />
                        </div>
                    ))}
                </div>
            );
        }

        for (let j = 1; j <= 6 - lastDayIndex; j++) {
            days.push(
                <div
                    className="calendar-day next-month text-gray-400"
                    key={`next-${j}`}
                >
                    {j}
                </div>
            );
        }

        return days;
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
        const month = currentDate.getMonth() + 1; // JavaScriptの月は0から始まるため+1
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
            <div className="py-12 bg-cream">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg mb-4">
                        <div className="p-6 bg-white border-b border-gray-200">
                            <div className="flex justify-between items-center w-full mb-4">
                                <img
                                    src={getSeasonIcon()}
                                    alt="Season Icon"
                                    className="h-12 w-12 mr-4 max-sm:h-10 max-sm:w-10"
                                />
                                <div className="flex items-center space-x-2 max-sm:space-x-1">
                                    <input
                                        type="text"
                                        placeholder="タグ検索"
                                        className="w-64 p-2 border border-gray-300 rounded-l-md max-sm:w-40 max-sm:p-1"
                                        value={searchQuery}
                                        onChange={(e) =>
                                            setSearchQuery(e.target.value)
                                        }
                                    />
                                    <button
                                        className="bg-[#FFA742] text-white p-2 rounded-r-md max-sm:p-1"
                                        onClick={() =>
                                            handleSearch(searchQuery)
                                        }
                                    >
                                        検索
                                    </button>
                                    <CalendarTagSelectButton
                                        onTagSelected={handleTagSelected}
                                    />
                                </div>
                                <button
                                    className="bg-[#80ACCF] text-white p-2 rounded-full shadow-md ml-4 max-sm:p-1"
                                    onClick={() => setIsModalOpen(true)}
                                    style={{
                                        width: "40px",
                                        height: "40px",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                    }}
                                >
                                    ＋
                                </button>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6 bg-white border-b border-gray-200">
                            <div className="flex flex-col items-center font-comic">
                                <div className="flex justify-between items-center w-full p-4 bg-cream rounded-lg mb-4">
                                    <button
                                        className="bg-pink-200 p-2 rounded-md text-white font-bold shadow-md max-sm:p-1"
                                        onClick={handlePrevMonth}
                                    >
                                        &lt;
                                    </button>
                                    <div
                                        className="text-xl font-bold text-pink-500 max-sm:text-lg cursor-pointer"
                                        onClick={() => setIsDateModalOpen(true)}
                                    >
                                        {currentDate.toLocaleString("ja-JP", {
                                            year: "numeric",
                                            month: "long",
                                        })}
                                    </div>
                                    <button
                                        className="bg-pink-200 p-2 rounded-md text-white font-bold shadow-md max-sm:p-1"
                                        onClick={handleNextMonth}
                                    >
                                        &gt;
                                    </button>
                                </div>
                                <CalendarModal
                                    isOpen={isModalOpen}
                                    onClose={() => setIsModalOpen(false)}
                                >
                                    <CalendarCreateEventForm
                                        onEventCreated={handleEventCreated}
                                        selectedDate={currentDate
                                            .toISOString()
                                            .slice(0, 16)}
                                    />
                                </CalendarModal>
                                <DateChangeModal
                                    isOpen={isDateModalOpen}
                                    onClose={() => setIsDateModalOpen(false)}
                                    onDateChange={handleDateChange}
                                />
                                <div className="grid grid-cols-7 gap-2 w-full text-center text-pink-500 font-bold">
                                    <div>日</div>
                                    <div>月</div>
                                    <div>火</div>
                                    <div>水</div>
                                    <div>木</div>
                                    <div>金</div>
                                    <div>土</div>
                                </div>
                                <div className="grid grid-cols-7 gap-2 w-full mt-4">
                                    {renderCalendar().map((day, index) => (
                                        <div
                                            key={index}
                                            className="flex justify-center items-center h-12 cursor-pointer"
                                        >
                                            {day}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
