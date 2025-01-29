import React, { useEffect, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
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
import HeaderSidebarLayout from "@/Layouts/HeaderSidebarLayout";
import WeatherDetailsModal from "./Partials/Modals/WeatherDetailsModal";
import {
    fetchWeatherData,
    fetchCityWeatherData,
    fetchCurrentLocationWeatherData,
    renderWeatherInfo,
} from "./Partials/UI/WeatherUtils";
import {
    initializeMap,
    handleCityClick,
    handleCitySelect,
} from "./Partials/UI/MapUtils";

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

const Notification = ({ message, type, onClose }) => {
    return (
        <div
            className={`fixed bottom-0 left-0 right-0 p-4 ${
                type === "error" ? "bg-red-600" : "bg-green-600"
            } text-white text-center`}
        >
            {message}
            <button
                className="ml-4 bg-transparent border-none text-white"
                onClick={onClose}
            >
                &times;
            </button>
        </div>
    );
};

const Weather = () => {
    const [weatherData, setWeatherData] = useState(null);
    const [currentLocation, setCurrentLocation] = useState(null);
    const [selectedCity, setSelectedCity] = useState(null);
    const [selectedCityWeather, setSelectedCityWeather] = useState(null);
    const [modalIsOpen, setModalIsOpen] = useState(false);
    const [map, setMap] = useState(null);
    const [markers, setMarkers] = useState([]);
    const [notification, setNotification] = useState({ message: "", type: "" });

    useEffect(() => {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const { latitude, longitude } = position.coords;
                setCurrentLocation({ lat: latitude, lon: longitude });
                fetchCurrentLocationWeatherData(
                    latitude,
                    longitude,
                    setWeatherData,
                    setSelectedCityWeather,
                    apiKey,
                    (message, type) => setNotification({ message, type })
                );
                initializeMap(
                    latitude,
                    longitude,
                    setMap,
                    setMarkers,
                    cities,
                    setSelectedCity,
                    setWeatherData,
                    setSelectedCityWeather,
                    apiKey
                );
            },
            (error) => {
                console.error("Error getting location:", error);
                initializeMap(
                    35.6895,
                    139.6917,
                    setMap,
                    setMarkers,
                    cities,
                    setSelectedCity,
                    setWeatherData,
                    setSelectedCityWeather,
                    apiKey
                );
            }
        );
    }, []);

    return (
        <HeaderSidebarLayout>
            <div className="bg-cream flex items-center justify-center p-4 min-h-screen sm:min-h-[calc(100vh-96px)]">
                <div className="bg-white rounded-lg shadow-lg p-2 max-w-4xl w-full mb-4">
                    <div className="font-sans flex flex-col md:flex-row">
                        <section className="w-full md:w-1/2 p-2">
                            <div className="mb-4">
                                <select
                                    className="w-full p-2 border border-gray-300 rounded"
                                    value={
                                        selectedCity ? selectedCity.name : ""
                                    }
                                    onChange={(e) =>
                                        handleCitySelect(
                                            e,
                                            currentLocation,
                                            fetchWeatherData,
                                            fetchCityWeatherData,
                                            setSelectedCity,
                                            setWeatherData,
                                            setSelectedCityWeather,
                                            map,
                                            cities,
                                            apiKey,
                                            (message, type) =>
                                                setNotification({
                                                    message,
                                                    type,
                                                })
                                        )
                                    }
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
                                    className="bg-[#80ACCF] hover:bg-blue-500 text-white py-2 px-4 rounded"
                                    onClick={() => setModalIsOpen(true)}
                                >
                                    5日間の天気情報を見る
                                </button>
                            </div>
                            <div className="w-full flex justify-center">
                                {renderWeatherInfo(selectedCityWeather)}
                            </div>
                        </section>
                    </div>
                </div>
            </div>
            <WeatherDetailsModal
                isOpen={modalIsOpen}
                onClose={() => setModalIsOpen(false)}
                selectedCityWeather={selectedCityWeather}
                selectedCity={selectedCity}
            />
            {notification.message && (
                <Notification
                    message={notification.message}
                    type={notification.type}
                    onClose={() => setNotification({ message: "", type: "" })}
                />
            )}
        </HeaderSidebarLayout>
    );
};

export default Weather;
