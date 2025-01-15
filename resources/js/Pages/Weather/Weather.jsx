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
import WeatherModal from "./Partials/WeatherModal";
import {
    fetchWeatherData,
    fetchCityWeatherData,
    fetchCurrentLocationWeatherData,
    renderWeatherInfo,
} from "./Partials/WeatherUtils";
import {
    initializeMap,
    handleCityClick,
    handleCitySelect,
} from "./Partials/MapUtils";

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
                fetchCurrentLocationWeatherData(
                    latitude,
                    longitude,
                    setWeatherData,
                    setSelectedCityWeather,
                    apiKey
                );
                initializeMap(
                    latitude,
                    longitude,
                    setMap,
                    setMarkers,
                    cities,
                    setSelectedCity,
                    setWeatherData, // ここに追加
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
                    setWeatherData, // ここに追加
                    setSelectedCityWeather,
                    apiKey
                );
            }
        );
    }, []);

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
                                            apiKey
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
                                    className="bg-blue-500 hover:bg-blue-700 text-white py-2 px-4 rounded"
                                    onClick={() => setModalIsOpen(true)}
                                >
                                    5日間の天気情報を見る
                                </button>
                            </div>
                            {renderWeatherInfo(selectedCityWeather)}
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
