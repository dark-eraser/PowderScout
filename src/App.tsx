import React, { useEffect, useState, useRef } from 'react';
import { SkiStationService } from './services/SkiStationService';
import { WeatherService } from './services/WeatherService';
import { RankingEngine } from './logic/RankingEngine';
import { ScoredResort } from './services/types';
import { GeocodingService, LocationResult } from './services/GeocodingService';
import { Wind, Snowflake, CloudRain, Sun, Map, Search as SearchIcon, Navigation } from 'lucide-react';
import { getWeatherDescription } from './logic/WeatherCodes';

function App() {
    const [resorts, setResorts] = useState<ScoredResort[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<LocationResult[]>([]);
    const [currentLocationName, setCurrentLocationName] = useState('Nearby');
    const [sortBy, setSortBy] = useState<'rank' | 'snow' | 'lifts'>('rank');
    const [radius, setRadius] = useState<number>(100);
    const [lastLoc, setLastLoc] = useState<{ lat: number, lon: number, name: string } | null>(null);
    const searchTimeout = useRef<NodeJS.Timeout | null>(null);

    const sortedResorts = [...resorts].sort((a, b) => {
        if (sortBy === 'snow') return (b.weather?.snowDepth || 0) - (a.weather?.snowDepth || 0);
        if (sortBy === 'lifts') return b.liftCount - a.liftCount;
        return 0; // 'rank' is already sorted by RankingEngine
    });

    // Load settings
    useEffect(() => {
        if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
            chrome.storage.local.get(['radius'], (result) => {
                if (result.radius !== undefined) {
                    setRadius(Number(result.radius));
                }
            });
        }
    }, []);

    const loadData = async (lat: number, lon: number, name: string = 'Nearby', targetRadius?: number) => {
        try {
            setLoading(true);
            setError(null);
            setCurrentLocationName(name);
            setLastLoc({ lat, lon, name });

            const searchRadius = targetRadius || radius;
            await SkiStationService.fetchResorts();
            let nearby = SkiStationService.getNearbyResorts(lat, lon, searchRadius);

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

            const limit = 15;
            const selection = nearby.slice(0, limit);
            const withWeather = await Promise.all(
                selection.map(async (resort: any) => {
                    const weather = await WeatherService.getForecast(resort.latitude, resort.longitude, resort.peakElevation);
                    return { ...resort, weather };
                })
            );

            const ranked = RankingEngine.rankResorts(withWeather as ScoredResort[]);
            setResorts(ranked);
        } catch (err: any) {
            console.error(err);
            setError("Failed to load data. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const handleGeolocate = () => {
        setLoading(true);
        setError(null);
        navigator.geolocation.getCurrentPosition(
            (pos) => loadData(pos.coords.latitude, pos.coords.longitude, 'Nearby'),
            (err) => {
                console.error(err);
                setLoading(false);
                setError("Location access denied. Please search for a city manually.");
            },
            { timeout: 5000, enableHighAccuracy: false }
        );
    };

    useEffect(() => {
        handleGeolocate();
    }, []);

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        setSearchQuery(val);

        if (searchTimeout.current) clearTimeout(searchTimeout.current);

        if (val.length > 2) {
            searchTimeout.current = setTimeout(async () => {
                const results = await GeocodingService.search(val);
                setSearchResults(results);
            }, 300);
        } else {
            setSearchResults([]);
        }
    };

    const selectLocation = (loc: LocationResult) => {
        setSearchQuery('');
        setSearchResults([]);
        loadData(loc.latitude, loc.longitude, loc.name);
    };

    const handleRadiusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const newRadius = parseInt(e.target.value);
        setRadius(newRadius);
        if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
            chrome.storage.local.set({ radius: newRadius });
        }
        if (lastLoc) {
            loadData(lastLoc.lat, lastLoc.lon, lastLoc.name, newRadius);
        }
    };

    return (
        <div className="container">
            <header className="header">
                <h1>PowderScout</h1>
                <div className="header-actions">
                    <select className="radius-select" value={radius} onChange={handleRadiusChange} title="Search radius">
                        <option value="50">50km</option>
                        <option value="100">100km</option>
                        <option value="150">150km</option>
                        <option value="200">200km</option>
                        <option value="300">300km</option>
                        <option value="400">400km</option>
                    </select>
                    <button className="btn" onClick={handleGeolocate} title="Use my current location">
                        <Navigation size={16} />
                    </button>
                </div>
            </header>

            <div className="location-bar" style={{ position: 'relative' }}>
                <input
                    type="text"
                    className="search-input"
                    placeholder="Search city (e.g. Geneva)"
                    value={searchQuery}
                    onChange={handleSearchChange}
                />
                {searchResults.length > 0 && (
                    <div className="search-results">
                        {searchResults.map((loc, i) => (
                            <div key={i} className="search-result-item" onClick={() => selectLocation(loc)}>
                                {loc.name}, {loc.admin1 ? `${loc.admin1}, ` : ''}{loc.country}
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <div className="sort-bar">
                <button
                    className={`sort-btn ${sortBy === 'rank' ? 'active' : ''}`}
                    onClick={() => setSortBy('rank')}
                >Best</button>
                <button
                    className={`sort-btn ${sortBy === 'snow' ? 'active' : ''}`}
                    onClick={() => setSortBy('snow')}
                >Snow</button>
                <button
                    className={`sort-btn ${sortBy === 'lifts' ? 'active' : ''}`}
                    onClick={() => setSortBy('lifts')}
                >Lifts</button>
            </div>

            {loading ? (
                <div className="loading">
                    <div className="spinner"></div>
                    <p>Analyzing conditions...</p>
                </div>
            ) : error ? (
                <div className="error">
                    <p>{error}</p>
                </div>
            ) : (
                <div className="resort-list">
                    {sortedResorts.map((resort, index) => (
                        <div key={resort.id} className="resort-card">
                            <div className="rank-indicator">
                                {sortBy === 'rank' ? `Rank #${index + 1}` :
                                    sortBy === 'snow' ? `${resort.weather?.snowDepth}cm` :
                                        `${resort.liftCount} Lifts`}
                            </div>
                            <h2 className="resort-name">
                                {resort.website ? (
                                    <a href={resort.website} target="_blank" rel="noopener noreferrer" className="resort-link">
                                        {resort.name}
                                    </a>
                                ) : (
                                    resort.name
                                )}
                            </h2>
                            <p className="resort-dist">{resort.distance?.toFixed(1)} km away</p>

                            {resort.weather && (
                                <div className="weather-grid">
                                    <div className="weather-item">
                                        <Map size={14} />
                                        <span>Lifts: <span className="weather-val">{resort.liftCount ?? '-'}</span></span>
                                    </div>
                                    <div className="weather-item">
                                        {resort.weather.weatherCode <= 3 ? <Sun size={14} /> : <Snowflake size={14} />}
                                        <span className="weather-val">{getWeatherDescription(resort.weather.weatherCode)}</span>
                                    </div>
                                    <div className="weather-item">
                                        <Snowflake size={14} />
                                        <span>Peak: <span className="weather-val">{resort.weather.snowDepth}cm</span> {resort.peakElevation ? `@ ${resort.peakElevation}m` : ''}</span>
                                    </div>
                                    <div className="weather-item">
                                        <Snowflake size={14} />
                                        <span>Fresh: <span className="weather-val">{resort.weather.snowfall}cm</span></span>
                                    </div>
                                    <div className="weather-item">
                                        <Wind size={14} />
                                        <span>Wind: <span className="weather-val">{resort.weather.windSpeed}km/h</span></span>
                                    </div>
                                    <div className="weather-item">
                                        <CloudRain size={14} />
                                        <span>Temp: <span className="weather-val">{resort.weather.tempMax}°C</span></span>
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default App;
