import L from "leaflet";
import {
    fetchWeatherData,
    fetchCityWeatherData,
    fetchCurrentLocationWeatherData,
} from "./WeatherUtils";

export const initializeMap = (
    lat,
    lon,
    setMap,
    setMarkers,
    cities,
    setSelectedCity,
    setWeatherData,
    setSelectedCityWeather,
    apiKey
) => {
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
        .on("click", () =>
            handleCurrentLocationClick(
                { lat, lon },
                setSelectedCity,
                setWeatherData,
                setSelectedCityWeather,
                mapInstance,
                apiKey
            )
        )
        .openPopup();
    setMarkers((prevMarkers) => [...prevMarkers, initialMarker]);

    cities.forEach((city) => {
        const cityMarker = L.marker([city.lat, city.lon])
            .addTo(mapInstance)
            .bindPopup(city.name)
            .on("click", () =>
                handleCityClick(
                    city,
                    setSelectedCity,
                    setSelectedCityWeather,
                    mapInstance,
                    apiKey
                )
            );
        setMarkers((prevMarkers) => [...prevMarkers, cityMarker]);
    });
};

export const handleCityClick = (
    city,
    setSelectedCity,
    setSelectedCityWeather,
    map,
    apiKey
) => {
    setSelectedCity(city);
    fetchCityWeatherData(city.lat, city.lon, setSelectedCityWeather, apiKey);
    if (map) {
        map.setView([city.lat, city.lon], 7);
        L.popup({
            offset: L.point(0, -20),
        })
            .setLatLng([city.lat, city.lon])
            .setContent(city.name)
            .openOn(map);
    }
};

export const handleCurrentLocationClick = (
    location,
    setSelectedCity,
    setWeatherData,
    setSelectedCityWeather,
    map,
    apiKey
) => {
    setSelectedCity(null);
    fetchCurrentLocationWeatherData(
        location.lat,
        location.lon,
        setWeatherData,
        setSelectedCityWeather,
        apiKey
    );
    if (map) {
        map.setView([location.lat, location.lon], 8); // ズームレベルを2つ引く
        L.popup({
            offset: L.point(0, -20), // ポップアップの位置を調整
        })
            .setLatLng([location.lat, location.lon])
            .setContent("現在位置")
            .openOn(map);
    }
};

export const handleCitySelect = (
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
) => {
    const cityName = e.target.value;
    if (cityName === "") {
        handleCurrentLocationClick(
            currentLocation,
            setSelectedCity,
            setWeatherData,
            setSelectedCityWeather,
            map,
            apiKey
        );
    } else {
        const city = cities.find((c) => c.name === cityName);
        if (city) {
            setSelectedCity(city);
            fetchCityWeatherData(
                city.lat,
                city.lon,
                setSelectedCityWeather,
                apiKey
            );
            if (map) {
                map.setView([city.lat, city.lon], 8); // ズームレベルを2つ引く
                L.popup({
                    offset: L.point(0, -20), // ポップアップの位置を調整
                })
                    .setLatLng([city.lat, city.lon])
                    .setContent(city.name)
                    .openOn(map);
            }
        }
    }
};
