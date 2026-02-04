export interface SkiResort {
    id: string;
    name: string;
    latitude: number;
    longitude: number;
    liftCount: number;
    website?: string;
    peakElevation?: number;
    distance?: number;
}

export interface WeatherData {
    snowfall: number;
    snowDepth: number;
    windSpeed: number;
    weatherCode: number;
    tempMax: number;
    tempMin: number;
}

export interface ScoredResort extends SkiResort {
    weather?: WeatherData;
    forecast?: WeatherData[];
    score?: number;
}
