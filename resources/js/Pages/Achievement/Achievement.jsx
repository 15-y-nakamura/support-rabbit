import React, { useState, useEffect } from "react";
import HeaderSidebarLayout from "@/Layouts/HeaderSidebarLayout";
import axios from "axios";
import { Bar } from "react-chartjs-2";
import "chart.js/auto";
import ChangeDateModal from "./ChangeDateModal";

const Achievement = () => {
    const [achievements, setAchievements] = useState([]);
    const [dateRange, setDateRange] = useState("day"); // 日、週、月の範囲
    const [isDateModalOpen, setIsDateModalOpen] = useState(false);
    const [currentDate, setCurrentDate] = useState(new Date());

    useEffect(() => {
        fetchAchievements();
    }, [dateRange]);

    const fetchAchievements = async () => {
        try {
            const response = await axios.get("/api/achievements", {
                params: { range: dateRange },
            });
            setAchievements(response.data);
        } catch (error) {
            console.error("Error fetching achievements:", error);
        }
    };

    const handleDateRangeChange = (e) => {
        setDateRange(e.target.value);
    };

    const handleDateChange = (year, month) => {
        setCurrentDate(new Date(year, month - 1, 1));
    };

    const chartData = {
        labels: achievements.map((achievement) => achievement.achieved_at),
        datasets: [
            {
                label: "達成件数",
                data: achievements.map((achievement) => achievement.count),
                backgroundColor: "rgba(75, 192, 192, 0.2)",
                borderColor: "rgba(75, 192, 192, 1)",
                borderWidth: 1,
            },
        ],
    };

    return (
        <HeaderSidebarLayout>
            <div className="py-12 bg-cream min-h-screen">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6 bg-white border-b border-gray-200">
                            <div className="mb-4 flex justify-between items-center">
                                <div>
                                    <label htmlFor="dateRange" className="mr-2">
                                        表示範囲:
                                    </label>
                                    <select
                                        id="dateRange"
                                        value={dateRange}
                                        onChange={handleDateRangeChange}
                                    >
                                        <option value="day">日</option>
                                        <option value="week">週</option>
                                        <option value="month">月</option>
                                    </select>
                                </div>
                                <div>
                                    <button
                                        className="bg-pink-200 p-2 rounded-md text-white font-bold shadow-md"
                                        onClick={() => setIsDateModalOpen(true)}
                                    >
                                        日付を変更
                                    </button>
                                </div>
                            </div>
                            <div className="mb-4">
                                <div className="text-lg font-bold">
                                    現在の日付:{" "}
                                    {currentDate.toLocaleDateString("ja-JP")}
                                </div>
                            </div>
                            <Bar data={chartData} />
                            <div className="mt-6">
                                <h2 className="text-lg font-semibold">
                                    達成したデータ
                                </h2>
                                <ul>
                                    {achievements.map((achievement) => (
                                        <li
                                            key={achievement.id}
                                            className="mb-2"
                                        >
                                            <div>
                                                日付: {achievement.achieved_at}
                                            </div>
                                            <div>
                                                タイトル: {achievement.title}
                                            </div>
                                            <div>
                                                開始時間:{" "}
                                                {achievement.start_time}
                                            </div>
                                            <div>
                                                終了時間: {achievement.end_time}
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <ChangeDateModal
                isOpen={isDateModalOpen}
                onClose={() => setIsDateModalOpen(false)}
                onDateChange={handleDateChange}
            />
        </HeaderSidebarLayout>
    );
};

export default Achievement;
