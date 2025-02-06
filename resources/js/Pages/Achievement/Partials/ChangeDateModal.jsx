import React, { useState } from "react";
import EventModal from "../../../Components/EventModal"; // 修正されたインポートパス

export default function ChangeDateModal({ isOpen, onClose, onDateChange }) {
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
    const [selectedMonth, setSelectedMonth] = useState(
        new Date().getMonth() + 1
    );
    const [selectedDay, setSelectedDay] = useState(new Date().getDate());

    const handleDateChange = () => {
        onDateChange(selectedYear, selectedMonth, selectedDay);
        onClose();
    };

    const handleTodayClick = () => {
        const today = new Date();
        setSelectedYear(today.getFullYear());
        setSelectedMonth(today.getMonth() + 1);
        setSelectedDay(today.getDate());
        onDateChange(
            today.getFullYear(),
            today.getMonth() + 1,
            today.getDate()
        );
        onClose();
    };

    return (
        <EventModal isOpen={isOpen} onClose={onClose}>
            <div className="flex flex-col items-center space-y-6">
                <div className="flex items-center space-x-4">
                    <div className="text-lg font-bold">
                        本日の日付: {new Date().toLocaleDateString("ja-JP")}
                    </div>
                    <button
                        className="bg-customPink p-2 rounded-md text-white font-bold shadow-md"
                        onClick={handleTodayClick}
                    >
                        本日の日付に移動
                    </button>
                </div>
                <hr className="w-full border-t border-gray-300" />
                <div className="flex items-center space-x-4">
                    <div className="flex flex-col">
                        <label className="font-bold">年</label>
                        <input
                            type="number"
                            value={selectedYear}
                            onChange={(e) => setSelectedYear(e.target.value)}
                            className="p-2 border border-gray-300 rounded"
                        />
                    </div>
                    <div className="flex flex-col">
                        <label className="font-bold">月</label>
                        <select
                            value={selectedMonth}
                            onChange={(e) => setSelectedMonth(e.target.value)}
                            className="p-2 border border-gray-300 rounded w-40"
                        >
                            {Array.from({ length: 12 }, (_, i) => (
                                <option key={i} value={i + 1}>
                                    {i + 1}月
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className="flex flex-col">
                        <label className="font-bold">日</label>
                        <select
                            value={selectedDay}
                            onChange={(e) => setSelectedDay(e.target.value)}
                            className="p-2 border border-gray-300 rounded w-40"
                        >
                            {Array.from({ length: 31 }, (_, i) => (
                                <option key={i} value={i + 1}>
                                    {i + 1}日
                                </option>
                            ))}
                        </select>
                    </div>
                    <button
                        className="bg-customPink p-2 rounded-md text-white font-bold shadow-md mt-6"
                        onClick={handleDateChange}
                    >
                        移動
                    </button>
                </div>
            </div>
        </EventModal>
    );
}
