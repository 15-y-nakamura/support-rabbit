import React, { useEffect, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Line } from "react-chartjs-2";
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
} from "chart.js";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import WeatherModal from "./WeatherModal";

// Leafletのデフォルトアイコンを設定
delete L.Icon.Default.prototype._getIconUrl;

L.Icon.Default.mergeOptions({
    iconRetinaUrl:
        "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
    iconUrl:
        "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
    shadowUrl:
        "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend
);

const apiKey = "6a043120bfc561a280f54712dc2575e0";
const cities = [
    { name: "東京", lat: 35.6895, lon: 139.6917 },
    { name: "大阪", lat: 34.6937, lon: 135.5023 },
    { name: "札幌", lat: 43.0642, lon: 141.3469 },
    { name: "横浜", lat: 35.4437, lon: 139.638 },
    { name: "京都", lat: 35.0211, lon: 135.7556 },
];

const Weather = () => {
    const [weatherData, setWeatherData] = useState(null);
    const [currentLocation, setCurrentLocation] = useState(null);
    const [selectedCity, setSelectedCity] = useState(null);
    const [selectedCityWeather, setSelectedCityWeather] = useState(null);
    const [modalIsOpen, setModalIsOpen] = useState(false);
    const [map, setMap] = useState(null);
    const [markers, setMarkers] = useState([]);

    useEffect(() => {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const { latitude, longitude } = position.coords;
                setCurrentLocation({ lat: latitude, lon: longitude });
                fetchWeatherData(latitude, longitude);
                initializeMap(latitude, longitude);
            },
            (error) => {
                console.error("Error getting location:", error);
                initializeMap(35.6895, 139.6917); // デフォルト位置を東京に設定
            }
        );
    }, []);

    const fetchWeatherData = async (lat, lon) => {
        const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&lang=ja&appid=${apiKey}`;
        try {
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error("Failed to fetch weather data");
            }
            const data = await response.json();
            setWeatherData(data);
        } catch (error) {
            console.error("Error fetching weather data:", error);
        }
    };

    const fetchCityWeatherData = async (lat, lon) => {
        const url = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&units=metric&lang=ja&appid=${apiKey}`;
        try {
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error("Failed to fetch city weather data");
            }
            const data = await response.json();
            setSelectedCityWeather(data);
        } catch (error) {
            console.error("Error fetching city weather data:", error);
        }
    };

    const initializeMap = (lat, lon) => {
        if (L.DomUtil.get("map")._leaflet_id) {
            return; // マップが既に初期化されている場合は何もしない
        }

        const mapInstance = L.map("map", { zIndex: 0 }).setView(
            [35.6895, 139.6917],
            5
        ); // 東京を中心に設定
        setMap(mapInstance);

        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
            attribution:
                '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        }).addTo(mapInstance);

        // 日本全体を表示するための境界を設定
        const bounds = [
            [24.396308, 122.93457], // 南西端 (沖縄)
            [45.551483, 153.986672], // 北東端 (北海道)
        ];
        mapInstance.fitBounds(bounds);

        const initialMarker = L.marker([lat, lon])
            .addTo(mapInstance)
            .bindPopup("現在位置")
            .openPopup();
        setMarkers((prevMarkers) => [...prevMarkers, initialMarker]);

        cities.forEach((city) => {
            const cityMarker = L.marker([city.lat, city.lon])
                .addTo(mapInstance)
                .bindPopup(city.name)
                .on("click", () => handleCityClick(city));
            setMarkers((prevMarkers) => [...prevMarkers, cityMarker]);
        });
    };

    const handleCityClick = (city) => {
        setSelectedCity(city);
        fetchCityWeatherData(city.lat, city.lon);
        if (map) {
            map.setView([city.lat, city.lon], 10);
            L.popup()
                .setLatLng([city.lat, city.lon])
                .setContent(city.name)
                .openOn(map);
        }
    };

    const handleCitySelect = (city) => {
        setSelectedCity(city);
        fetchCityWeatherData(city.lat, city.lon);
        if (map) {
            map.setView([city.lat, city.lon], 8); // ズームアウトレベルを調整
            const newMarker = L.marker([city.lat, city.lon])
                .addTo(map)
                .bindPopup(city.name)
                .openPopup();
            setMarkers((prevMarkers) => [...prevMarkers, newMarker]); // 新しいピンを追加
        }
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

    const renderWeatherInfo = () => {
        if (!selectedCityWeather) return <p>Loading...</p>;

        // 日付ごとにグループ化された天気データを取得
        const dailyWeather = selectedCityWeather.list.reduce(
            (acc, forecast) => {
                const date = new Date(forecast.dt * 1000).toLocaleDateString();
                if (!acc[date]) {
                    acc[date] = [];
                }
                acc[date].push(forecast);
                return acc;
            },
            {}
        );

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
                    borderColor: "rgba(255, 99, 132, 1)",
                    backgroundColor: "rgba(255, 99, 132, 0.2)",
                },
                {
                    label: "最低気温 (°C)",
                    data: tempMinData,
                    borderColor: "rgba(54, 162, 235, 1)",
                    backgroundColor: "rgba(54, 162, 235, 0.2)",
                },
                {
                    label: "降水確率 (%)",
                    data: popData,
                    borderColor: "rgba(75, 192, 192, 1)",
                    backgroundColor: "rgba(75, 192, 192, 0.2)",
                },
            ],
        };

        // 現在の日の天気情報を1日全体のものとして表示
        const currentDayWeather = {
            icon: currentDayForecasts[0]?.weather[0]?.icon || "01d",
            temp_max: Math.max(
                ...currentDayForecasts.map((f) => f.main.temp_max)
            ),
            temp_min: Math.min(
                ...currentDayForecasts.map((f) => f.main.temp_min)
            ),
            pop: Math.round(
                Math.max(...currentDayForecasts.map((f) => f.pop)) * 100
            ),
        };

        const backgroundColor = getBackgroundColor(currentDayWeather.icon);
        const textColor = getTextColor(currentDayWeather.icon);

        return (
            <div className="w-full">
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
                            <td className="px-4 py-2">
                                {currentDayWeather.pop}%
                            </td>
                        </tr>
                    </tbody>
                </table>
                <div
                    className="mb-4"
                    style={{ maxWidth: "500px", margin: "0 auto" }}
                >
                    <Line data={data} />
                </div>
            </div>
        );
    };

    return (
        <AuthenticatedLayout>
            <div className="bg-cream flex items-center justify-center p-4">
                <div className="bg-white rounded-lg shadow-lg p-6 max-w-4xl w-full mb-4">
                    <div className="font-sans flex flex-col md:flex-row">
                        <section className="w-full md:w-1/2 p-2">
                            <div className="mb-4">
                                <select
                                    className="w-full p-2 border border-gray-300 rounded"
                                    value={
                                        selectedCity ? selectedCity.name : ""
                                    }
                                    onChange={(e) => {
                                        const city = cities.find(
                                            (city) =>
                                                city.name === e.target.value
                                        );
                                        if (city) {
                                            handleCitySelect(city);
                                        }
                                    }}
                                >
                                    <option value="">現在位置</option>
                                    {cities.map((city) => (
                                        <option
                                            key={city.name}
                                            value={city.name}
                                        >
                                            {city.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div
                                id="map"
                                style={{
                                    height: "300px",
                                    width: "100%",
                                    position: "relative",
                                    zIndex: 0,
                                }}
                                className="rounded-lg shadow-lg"
                            ></div>
                        </section>
                        <section className="w-full md:w-1/2 flex flex-col items-center p-2">
                            <div className="flex justify-between items-center w-full mb-4">
                                <h2 className="text-2xl text-black">
                                    {new Date().toLocaleDateString()}
                                </h2>
                                <button
                                    className="bg-blue-500 hover:bg-blue-700 text-white py-2 px-4 rounded"
                                    onClick={() => setModalIsOpen(true)}
                                >
                                    5日間の天気情報を見る
                                </button>
                            </div>
                            {renderWeatherInfo()}
                        </section>
                    </div>
                </div>
            </div>
            <WeatherModal
                isOpen={modalIsOpen}
                onClose={() => setModalIsOpen(false)}
                selectedCityWeather={selectedCityWeather}
            />
        </AuthenticatedLayout>
    );
};

export default Weather;
