import { jsxs as _jsxs, jsx as _jsx } from "react/jsx-runtime";
import { useEffect, useState, useRef } from 'react';
import { SkiStationService } from './services/SkiStationService';
import { WeatherService } from './services/WeatherService';
import { RankingEngine } from './logic/RankingEngine';
import { GeocodingService } from './services/GeocodingService';
import { Wind, Snowflake, CloudRain, Sun, Map, Navigation } from 'lucide-react';
import { getWeatherDescription } from './logic/WeatherCodes';
function App() {
    const [resorts, setResorts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [currentLocationName, setCurrentLocationName] = useState('Nearby');
    const [sortBy, setSortBy] = useState('rank');
    const searchTimeout = useRef(null);
    const sortedResorts = [...resorts].sort((a, b) => {
        if (sortBy === 'snow')
            return (b.weather?.snowDepth || 0) - (a.weather?.snowDepth || 0);
        if (sortBy === 'lifts')
            return b.liftCount - a.liftCount;
        return 0; // 'rank' is already sorted by RankingEngine
    });
    const loadData = async (lat, lon, name = 'Nearby') => {
        try {
            setLoading(true);
            setError(null);
            setCurrentLocationName(name);
            await SkiStationService.fetchResorts();
            let nearby = SkiStationService.getNearbyResorts(lat, lon, 100);
            if (nearby.length === 0) {
                nearby = SkiStationService.getNearbyResorts(lat, lon, 500);
            }
            if (nearby.length === 0) {
                nearby = SkiStationService.getNearbyResorts(lat, lon, 20000);
            }
            if (nearby.length === 0) {
                setError("No ski resorts found.");
                setLoading(false);
                return;
            }
            const top5 = nearby.slice(0, 5);
            const withWeather = await Promise.all(top5.map(async (resort) => {
                const weather = await WeatherService.getForecast(resort.latitude, resort.longitude, resort.peakElevation);
                return { ...resort, weather };
            }));
            const ranked = RankingEngine.rankResorts(withWeather);
            setResorts(ranked);
        }
        catch (err) {
            console.error(err);
            setError("Failed to load data. Please try again.");
        }
        finally {
            setLoading(false);
        }
    };
    const handleGeolocate = () => {
        setLoading(true);
        setError(null);
        navigator.geolocation.getCurrentPosition((pos) => loadData(pos.coords.latitude, pos.coords.longitude, 'Nearby'), (err) => {
            console.error(err);
            setLoading(false);
            setError("Location access denied. Please search for a city manually.");
        }, { timeout: 5000, enableHighAccuracy: false });
    };
    useEffect(() => {
        handleGeolocate();
    }, []);
    const handleSearchChange = (e) => {
        const val = e.target.value;
        setSearchQuery(val);
        if (searchTimeout.current)
            clearTimeout(searchTimeout.current);
        if (val.length > 2) {
            searchTimeout.current = setTimeout(async () => {
                const results = await GeocodingService.search(val);
                setSearchResults(results);
            }, 300);
        }
        else {
            setSearchResults([]);
        }
    };
    const selectLocation = (loc) => {
        setSearchQuery('');
        setSearchResults([]);
        loadData(loc.latitude, loc.longitude, loc.name);
    };
    return (_jsxs("div", { className: "container", children: [_jsxs("header", { className: "header", children: [_jsxs("h1", { children: [currentLocationName, " Slopes"] }), _jsx("button", { className: "btn", onClick: handleGeolocate, title: "Use my current location", children: _jsx(Navigation, { size: 16 }) })] }), _jsxs("div", { className: "location-bar", style: { position: 'relative' }, children: [_jsx("input", { type: "text", className: "search-input", placeholder: "Search city (e.g. Geneva)", value: searchQuery, onChange: handleSearchChange }), searchResults.length > 0 && (_jsx("div", { className: "search-results", children: searchResults.map((loc, i) => (_jsxs("div", { className: "search-result-item", onClick: () => selectLocation(loc), children: [loc.name, ", ", loc.admin1 ? `${loc.admin1}, ` : '', loc.country] }, i))) }))] }), _jsxs("div", { className: "sort-bar", children: [_jsx("button", { className: `sort-btn ${sortBy === 'rank' ? 'active' : ''}`, onClick: () => setSortBy('rank'), children: "Best" }), _jsx("button", { className: `sort-btn ${sortBy === 'snow' ? 'active' : ''}`, onClick: () => setSortBy('snow'), children: "Snow" }), _jsx("button", { className: `sort-btn ${sortBy === 'lifts' ? 'active' : ''}`, onClick: () => setSortBy('lifts'), children: "Lifts" })] }), loading ? (_jsxs("div", { className: "loading", children: [_jsx("div", { className: "spinner" }), _jsx("p", { children: "Analyzing conditions..." })] })) : error ? (_jsx("div", { className: "error", children: _jsx("p", { children: error }) })) : (_jsx("div", { className: "resort-list", children: sortedResorts.map((resort, index) => (_jsxs("div", { className: "resort-card", children: [_jsx("div", { className: "rank-indicator", children: sortBy === 'rank' ? `Rank #${index + 1}` :
                                sortBy === 'snow' ? `${resort.weather?.snowDepth}cm` :
                                    `${resort.liftCount} Lifts` }), _jsx("h2", { className: "resort-name", children: resort.website ? (_jsx("a", { href: resort.website, target: "_blank", rel: "noopener noreferrer", className: "resort-link", children: resort.name })) : (resort.name) }), _jsxs("p", { className: "resort-dist", children: [resort.distance?.toFixed(1), " km away"] }), resort.weather && (_jsxs("div", { className: "weather-grid", children: [_jsxs("div", { className: "weather-item", children: [_jsx(Map, { size: 14 }), _jsxs("span", { children: ["Lifts: ", _jsx("span", { className: "weather-val", children: resort.liftCount ?? '-' })] })] }), _jsxs("div", { className: "weather-item", children: [resort.weather.weatherCode <= 3 ? _jsx(Sun, { size: 14 }) : _jsx(Snowflake, { size: 14 }), _jsx("span", { className: "weather-val", children: getWeatherDescription(resort.weather.weatherCode) })] }), _jsxs("div", { className: "weather-item", children: [_jsx(Snowflake, { size: 14 }), _jsxs("span", { children: ["Peak: ", _jsxs("span", { className: "weather-val", children: [resort.weather.snowDepth, "cm"] }), " ", resort.peakElevation ? `@ ${resort.peakElevation}m` : ''] })] }), _jsxs("div", { className: "weather-item", children: [_jsx(Snowflake, { size: 14 }), _jsxs("span", { children: ["Fresh: ", _jsxs("span", { className: "weather-val", children: [resort.weather.snowfall, "cm"] })] })] }), _jsxs("div", { className: "weather-item", children: [_jsx(Wind, { size: 14 }), _jsxs("span", { children: ["Wind: ", _jsxs("span", { className: "weather-val", children: [resort.weather.windSpeed, "km/h"] })] })] }), _jsxs("div", { className: "weather-item", children: [_jsx(CloudRain, { size: 14 }), _jsxs("span", { children: ["Temp: ", _jsxs("span", { className: "weather-val", children: [resort.weather.tempMax, "\u00B0C"] })] })] })] }))] }, resort.id))) }))] }));
}
export default App;
//# sourceMappingURL=App.js.map