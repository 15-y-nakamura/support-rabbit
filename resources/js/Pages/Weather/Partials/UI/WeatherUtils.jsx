import React from "react";
import { Line } from "react-chartjs-2";

export const fetchWeatherData = async (
    lat,
    lon,
    setWeatherData,
    setSelectedCityWeather,
    apiKey,
    setNotification
) => {
    const url = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&units=metric&lang=ja&appid=${apiKey}`;
    try {
        const response = await fetch(url);
        const data = await response.json();
        setWeatherData(data);
        setSelectedCityWeather(data);
    } catch (error) {
        console.error("天気データの取得中にエラーが発生しました:", error);
        setNotification("天気データの取得中にエラーが発生しました。", "error");
    }
};

export const fetchCityWeatherData = async (
    lat,
    lon,
    setSelectedCityWeather,
    apiKey,
    setNotification
) => {
    const url = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&units=metric&lang=ja&appid=${apiKey}`;
    try {
        const response = await fetch(url);
        const data = await response.json();
        setSelectedCityWeather(data);
    } catch (error) {
        console.error("都市の天気データの取得中にエラーが発生しました:", error);
        setNotification(
            "都市の天気データの取得中にエラーが発生しました。",
            "error"
        );
    }
};

export const fetchCurrentLocationWeatherData = async (
    lat,
    lon,
    setWeatherData,
    setSelectedCityWeather,
    apiKey,
    setNotification
) => {
    const url = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&units=metric&lang=ja&appid=${apiKey}`;
    try {
        const response = await fetch(url);
        const data = await response.json();
        setWeatherData(data);
        setSelectedCityWeather(data);
    } catch (error) {
        console.error(
            "現在位置の天気データの取得中にエラーが発生しました:",
            error
        );
        setNotification(
            "現在位置の天気データの取得中にエラーが発生しました。",
            "error"
        );
    }
};

const Loading = () => (
    <div className="fixed inset-0 flex items-center justify-center bg-white z-50">
        <div className="w-16 h-16 border-8 border-gray-200 border-t-pink-400 rounded-full animate-spin"></div>
    </div>
);

export const renderWeatherInfo = (selectedCityWeather) => {
    if (!selectedCityWeather || !selectedCityWeather.list) return <Loading />;

    // 日付ごとにグループ化された天気データを取得
    const dailyWeather = selectedCityWeather.list.reduce((acc, forecast) => {
        const date = new Date(forecast.dt * 1000).toLocaleDateString();
        if (!acc[date]) {
            acc[date] = [];
        }
        acc[date].push(forecast);
        return acc;
    }, {});

    const dates = Object.keys(dailyWeather);
    const currentDay = dates[0]; // 本日の日付
    const currentDayForecasts = dailyWeather[currentDay] || [];

    const labels = [
        "0:00",
        "3:00",
        "6:00",
        "9:00",
        "12:00",
        "15:00",
        "18:00",
        "21:00",
    ];
    const tempMaxData = labels.map((label) => {
        const forecast = currentDayForecasts.find(
            (f) => formatTime(new Date(f.dt * 1000)) === label
        );
        return forecast ? forecast.main.temp_max : null;
    });
    const tempMinData = labels.map((label) => {
        const forecast = currentDayForecasts.find(
            (f) => formatTime(new Date(f.dt * 1000)) === label
        );
        return forecast ? forecast.main.temp_min : null;
    });
    const popData = labels.map((label) => {
        const forecast = currentDayForecasts.find(
            (f) => formatTime(new Date(f.dt * 1000)) === label
        );
        return forecast ? Math.round(forecast.pop * 100) : null;
    });

    const data = {
        labels,
        datasets: [
            {
                label: "最高気温 (°C)",
                data: tempMaxData,
                borderColor: "#FF6384",
                backgroundColor: "#FF638433",
            },
            {
                label: "最低気温 (°C)",
                data: tempMinData,
                borderColor: "#36A2EB",
                backgroundColor: "#36A2EB33",
            },
            {
                label: "降水確率 (%)",
                data: popData,
                borderColor: "#4BC0C0",
                backgroundColor: "#4BC0C033",
            },
        ],
    };

    // 現在の日の天気情報を1日全体のものとして表示
    const currentDayWeather = {
        icon: currentDayForecasts[0]?.weather[0]?.icon || "01d",
        temp_max: Math.max(...currentDayForecasts.map((f) => f.main.temp_max)),
        temp_min: Math.min(...currentDayForecasts.map((f) => f.main.temp_min)),
        pop: Math.round(
            Math.max(...currentDayForecasts.map((f) => f.pop)) * 100
        ),
    };

    const backgroundColor = getBackgroundColor(currentDayWeather.icon);
    const textColor = getTextColor(currentDayWeather.icon);

    return (
        <div className="w-full flex flex-col items-center">
            <table className="table-auto w-full mb-4">
                <thead>
                    <tr style={{ color: "#000000" }}>
                        <th className="px-4 py-2">天気</th>
                        <th className="px-4 py-2">最高気温</th>
                        <th className="px-4 py-2">最低気温</th>
                        <th className="px-4 py-2">降水確率</th>
                    </tr>
                </thead>
                <tbody>
                    <tr
                        className="bg-cream border border-gray-300 rounded p-4 m-2 text-center"
                        style={{ backgroundColor, color: textColor }}
                    >
                        <td className="px-4 py-2">
                            <img
                                src={`http://openweathermap.org/img/wn/${currentDayWeather.icon}.png`}
                                alt="weather icon"
                                className="w-12 h-12 mx-auto"
                                onError={(e) => {
                                    e.target.onerror = null;
                                    e.target.src =
                                        "https://via.placeholder.com/50";
                                }}
                            />
                        </td>
                        <td className="px-4 py-2">
                            {currentDayWeather.temp_max}°C
                        </td>
                        <td className="px-4 py-2">
                            {currentDayWeather.temp_min}°C
                        </td>
                        <td className="px-4 py-2">{currentDayWeather.pop}%</td>
                    </tr>
                </tbody>
            </table>
            <div
                className="mb-4 w-full flex justify-center"
                style={{ maxWidth: "800px", margin: "0 auto" }}
            >
                <Line data={data} />
            </div>
        </div>
    );
};

const formatTime = (date) => {
    const hours = date.getHours();
    const minutes = date.getMinutes();
    return `${hours}:${minutes === 0 ? "00" : minutes}`;
};

const getBackgroundColor = (icon) => {
    switch (icon) {
        case "01d":
            return "#87CEEB"; // スカイブルー
        case "01n":
            return "#2C3E50"; // ネイビー
        case "02d":
            return "#B0C4DE"; // ライトスチールブルー
        case "02n":
            return "#34495E"; // ダークグレー
        case "03d":
        case "03n":
            return "#778899"; // スレートグレー
        case "09d":
        case "09n":
            return "#A4B0BE"; // ソフトグレー
        case "10d":
            return "#5DADE2"; // ライトブルー
        case "10n":
            return "#34495E"; // ダークグレー
        case "11d":
        case "11n":
            return "#2C3E50"; // ネイビー
        case "13d":
            return "#FFFFFF"; // ホワイト
        case "13n":
            return "#BDC3C7"; // ライトグレー
        case "50d":
            return "#D5DBDB"; // ライトグレー
        case "50n":
            return "#7F8C8D"; // ダークグレー
        default:
            return "#FFFFFF"; // デフォルトはホワイト
    }
};

const getTextColor = (icon) => {
    const darkBackgrounds = [
        "01n",
        "02n",
        "03d",
        "03n",
        "09n",
        "10n",
        "11d",
        "11n",
        "50n",
    ];
    return darkBackgrounds.includes(icon) ? "#FFFFFF" : "#000000";
};
