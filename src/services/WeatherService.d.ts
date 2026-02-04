import { WeatherData } from './types';
export declare class WeatherService {
    static getForecast(lat: number, lon: number, peakElevation?: number, baseElevation?: number): Promise<WeatherData[] | null>;
}
//# sourceMappingURL=WeatherService.d.ts.map