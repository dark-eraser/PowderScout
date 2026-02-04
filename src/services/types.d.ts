export interface SkiResort {
    id: string;
    name: string;
    latitude: number;
    longitude: number;
    liftCount: number;
    liftBreakdown?: Record<string, number>;
    website?: string;
    peakElevation?: number;
    baseElevation?: number;
    distance?: number;
}
export interface WeatherData {
    snowfall: number;
    snowDepth: number;
    baseSnowDepth?: number | undefined;
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
//# sourceMappingURL=types.d.ts.map