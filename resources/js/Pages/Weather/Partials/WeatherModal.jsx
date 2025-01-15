import React from "react";

const WeatherModal = ({
    isOpen,
    onClose,
    selectedCityWeather,
    selectedCity,
}) => {
    if (!isOpen || !selectedCityWeather) return null;

    const dailyWeather = selectedCityWeather.list.reduce((acc, forecast) => {
        const date = new Date(forecast.dt * 1000).toLocaleDateString();
        if (!acc[date]) {
            acc[date] = [];
        }
        acc[date].push(forecast);
        return acc;
    }, {});

    const dates = Object.keys(dailyWeather).slice(0, 5); // 本日を含む5日間
    const modalData = dates.map((date) => {
        const dayForecasts = dailyWeather[date] || [];
        const temp_max = Math.max(...dayForecasts.map((f) => f.main.temp_max));
        const temp_min = Math.min(...dayForecasts.map((f) => f.main.temp_min));
        const pop = Math.round(
            Math.max(...dayForecasts.map((f) => f.pop)) * 100
        );
        const icon = dayForecasts[0]?.weather[0]?.icon || "01d";

        return { date, temp_max, temp_min, pop, icon };
    });

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

    return (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-white p-6 rounded shadow-lg relative max-w-md w-full max-h-[90vh] overflow-y-auto sm:max-w-2xl z-50">
                <button
                    className="absolute top-0 right-0 mt-2 mr-2 text-gray-600"
                    onClick={onClose}
                >
                    &times;
                </button>
                <h2 className="text-2xl text-black mb-4">
                    {selectedCity
                        ? `${selectedCity.name}の5日間の天気情報`
                        : "5日間の天気情報"}
                </h2>
                <div className="hidden sm:block overflow-x-auto">
                    <table className="table-auto w-full mb-4">
                        <thead>
                            <tr>
                                <th className="px-4 py-2">日付</th>
                                <th className="px-4 py-2">天気</th>
                                <th className="px-4 py-2">最高気温</th>
                                <th className="px-4 py-2">最低気温</th>
                                <th className="px-4 py-2">降水確率</th>
                            </tr>
                        </thead>
                        <tbody>
                            {modalData.map((day, index) => {
                                const backgroundColor = getBackgroundColor(
                                    day.icon
                                );
                                const textColor = getTextColor(day.icon);
                                return (
                                    <tr
                                        key={index}
                                        className="bg-cream border border-gray-300 rounded p-4 m-2 text-center"
                                        style={{
                                            backgroundColor,
                                            color: textColor,
                                        }}
                                    >
                                        <td className="px-4 py-2">
                                            {day.date}
                                        </td>
                                        <td className="px-4 py-2">
                                            <img
                                                src={`http://openweathermap.org/img/wn/${day.icon}.png`}
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
                                            {day.temp_max}°C
                                        </td>
                                        <td className="px-4 py-2">
                                            {day.temp_min}°C
                                        </td>
                                        <td className="px-4 py-2">
                                            {day.pop}%
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
                <div className="block sm:hidden">
                    {modalData.map((day, index) => {
                        const backgroundColor = getBackgroundColor(day.icon);
                        const textColor = getTextColor(day.icon);
                        return (
                            <div
                                key={index}
                                className="bg-cream border border-gray-300 rounded p-4 m-2 text-center"
                                style={{
                                    backgroundColor,
                                    color: textColor,
                                }}
                            >
                                <div className="mb-2">{day.date}</div>
                                <div className="mb-2">
                                    <img
                                        src={`http://openweathermap.org/img/wn/${day.icon}.png`}
                                        alt="weather icon"
                                        className="w-12 h-12 mx-auto"
                                        onError={(e) => {
                                            e.target.onerror = null;
                                            e.target.src =
                                                "https://via.placeholder.com/50";
                                        }}
                                    />
                                </div>
                                <div className="mb-2">
                                    最高気温: {day.temp_max}°C
                                </div>
                                <div className="mb-2">
                                    最低気温: {day.temp_min}°C
                                </div>
                                <div className="mb-2">降水確率: {day.pop}%</div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default WeatherModal;
