import React, { useEffect, useState } from "react";
import HeaderSidebarLayout from "@/Layouts/HeaderSidebarLayout";
import axios from "axios";
import { Bar } from "react-chartjs-2";
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
} from "chart.js";
import ChangeDateModal from "./Partials/ChangeDateModal"; // モーダルのインポート

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend
);

const Achievement = () => {
    // 認証トークンを取得する関数
    const getAuthToken = () => {
        const token = localStorage.getItem("authToken");
        if (!token) {
            console.error("Auth token is missing");
        }
        return token;
    };

    // 一週間分の日付を取得する関数
    const getLastWeekDates = (startDate = new Date()) => {
        const dates = [];
        for (let i = 6; i >= 0; i--) {
            const date = new Date(startDate);
            date.setDate(date.getDate() - i);
            dates.push(date.toLocaleDateString());
        }
        return dates;
    };

    // グラフのデータ
    const [chartData, setChartData] = useState({
        labels: getLastWeekDates(),
        datasets: [
            {
                label: "アチーブメント数",
                data: new Array(7).fill(0), // 初期状態では空のデータ
                backgroundColor: "rgba(75, 192, 192, 0.2)",
                borderColor: "rgba(75, 192, 192, 1)",
                borderWidth: 1,
            },
        ],
    });

    const [achievements, setAchievements] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false); // モーダルの状態管理
    const [selectedDate, setSelectedDate] = useState(new Date()); // 選択された日付の状態管理

    const fetchAchievements = async (startDate = new Date()) => {
        try {
            const token = getAuthToken();
            const response = await axios.get("/api/v2/achievements", {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            setAchievements(response.data.achievements);
            // グラフのデータを更新
            const updatedData = response.data.achievements.reduce(
                (acc, achievement) => {
                    const date = new Date(
                        achievement.achieved_at
                    ).toLocaleDateString();
                    const index = acc.labels.indexOf(date);
                    if (index !== -1) {
                        acc.data[index] += 1;
                    }
                    return acc;
                },
                {
                    labels: getLastWeekDates(startDate),
                    data: new Array(7).fill(0),
                }
            );
            setChartData({
                labels: updatedData.labels,
                datasets: [
                    {
                        label: "アチーブメント数",
                        data: updatedData.data,
                        backgroundColor: "rgba(75, 192, 192, 0.2)",
                        borderColor: "rgba(75, 192, 192, 1)",
                        borderWidth: 1,
                    },
                ],
            });
        } catch (error) {
            console.error("Error fetching achievements:", error);
        }
    };

    useEffect(() => {
        fetchAchievements(selectedDate);
    }, [selectedDate]);

    const handleDateChange = (year, month, day) => {
        const newDate = new Date(year, month - 1, day);
        setSelectedDate(newDate);
    };

    const formattedDate = selectedDate.toLocaleDateString("ja-JP");

    // 日付と時間単位でアチーブメントをグループ化
    const groupedAchievements = achievements.reduce((acc, achievement) => {
        const date = new Date(achievement.achieved_at).toLocaleDateString();
        const hour = new Date(achievement.start_time).getHours();
        if (!acc[date]) {
            acc[date] = {};
        }
        if (!acc[date][hour]) {
            acc[date][hour] = [];
        }
        acc[date][hour].push(achievement);
        return acc;
    }, {});

    // 一週間単位で日付をグループ化
    const groupedByWeek = getLastWeekDates(selectedDate).reduce((acc, date) => {
        if (groupedAchievements[date]) {
            acc[date] = groupedAchievements[date];
        }
        return acc;
    }, {});

    return (
        <HeaderSidebarLayout>
            <div className="bg-cream flex items-center justify-center p-4 min-h-screen sm:min-h-[calc(100vh-96px)]">
                <div className="bg-white rounded-lg shadow-lg p-2 w-full max-w-screen-xl h-[calc(100vh-50px)] sm:h-[calc(100vh-100px)] lg:h-[calc(100vh-150px)] mb-4">
                    <div className="font-sans flex flex-col md:flex-row h-full">
                        <section className="w-1/3 p-2 flex flex-col items-center justify-start">
                            <div className="flex items-center mb-4">
                                <h1 className="text-2xl font-bold mr-4">
                                    {formattedDate}
                                </h1>
                                <button
                                    className="bg-blue-500 text-white py-2 px-4 rounded"
                                    onClick={() => setIsModalOpen(true)} // モーダルを開く
                                >
                                    移動
                                </button>
                            </div>
                            <div
                                style={{
                                    backgroundColor: "#ffffff",
                                    backgroundImage:
                                        "linear-gradient(-45deg, rgba(250,215,215,.5) 25%, transparent 25%, transparent 50%, rgba(250,215,215,.5) 50%, rgba(250,215,215,.5) 75%, transparent 75%, transparent 100%), linear-gradient(45deg, rgba(250,215,215,.5) 25%, transparent 25%, transparent 50%, rgba(250,215,215,.5) 50%, rgba(250,215,215,.5) 75%, transparent 75%, transparent 100%)",
                                    backgroundSize: "40px 40px",
                                    transform: "rotate(3deg)",
                                    width: "30%",
                                    height: "50px",
                                    margin: "0 auto -1em auto",
                                }}
                            ></div>
                            <div
                                className="l-border l-p-t l-p-r l-p-b l-p-l"
                                style={{
                                    background: "#fff0f0",
                                    boxShadow:
                                        "4px 4px 4px rgba(0, 0, 0, 0.15)",
                                    padding: "25px 15px 15px 15px",
                                    width: "90%",
                                    height: "350px",
                                }}
                            >
                                {Object.keys(groupedByWeek).map((date) => (
                                    <div key={date}>
                                        <h2 className="text-xl font-bold mb-2">
                                            {date}
                                        </h2>
                                        {Object.keys(groupedByWeek[date]).map(
                                            (hour) => (
                                                <div key={hour}>
                                                    <div className="text-gray-600 font-bold border-b border-gray-300 py-1 mb-2">
                                                        {`${hour}:00`}
                                                    </div>
                                                    {groupedByWeek[date][
                                                        hour
                                                    ].map(
                                                        (
                                                            achievement,
                                                            index
                                                        ) => (
                                                            <div
                                                                key={index}
                                                                className="flex items-center mb-2"
                                                            >
                                                                <img
                                                                    src="/img/icons/hanamaru-icon.png"
                                                                    alt="はなまる"
                                                                    className="w-4 h-4 mr-2"
                                                                />
                                                                <div className="text-black font-bold">
                                                                    {new Date(
                                                                        achievement.start_time
                                                                    ).toLocaleTimeString(
                                                                        "ja-JP",
                                                                        {
                                                                            hour: "numeric",
                                                                            minute: "2-digit",
                                                                        }
                                                                    )}
                                                                    {" ~ "}
                                                                    {new Date(
                                                                        achievement.end_time ||
                                                                            achievement.start_time
                                                                    ).toLocaleTimeString(
                                                                        "ja-JP",
                                                                        {
                                                                            hour: "numeric",
                                                                            minute: "2-digit",
                                                                        }
                                                                    )}
                                                                    {" 　"}
                                                                    <span className="font-bold">
                                                                        {
                                                                            achievement.title
                                                                        }
                                                                    </span>
                                                                </div>
                                                            </div>
                                                        )
                                                    )}
                                                </div>
                                            )
                                        )}
                                    </div>
                                ))}
                            </div>
                        </section>
                        <section className="w-2/3 p-2">
                            <div className="h-full">
                                <Bar
                                    data={chartData}
                                    options={{
                                        maintainAspectRatio: false,
                                        scales: {
                                            y: {
                                                min: 0,
                                                max: 15,
                                                ticks: {
                                                    stepSize: 1,
                                                    callback: function (value) {
                                                        if (
                                                            [
                                                                0, 1, 3, 5, 10,
                                                                15,
                                                            ].includes(value)
                                                        ) {
                                                            return value;
                                                        }
                                                        return null;
                                                    },
                                                },
                                            },
                                        },
                                    }}
                                />
                            </div>
                        </section>
                    </div>
                </div>
            </div>
            <ChangeDateModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onDateChange={handleDateChange}
            />
        </HeaderSidebarLayout>
    );
};

export default Achievement;
