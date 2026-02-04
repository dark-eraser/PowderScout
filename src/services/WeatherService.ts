import { WeatherData } from './types';

const BASE_URL = 'https://api.open-meteo.com/v1/forecast';

export class WeatherService {
    static async getForecast(lat: number, lon: number, peakElevation?: number, baseElevation?: number): Promise<WeatherData[] | null> {
        const buildParams = (elev?: number) => ({
            latitude: lat.toString(),
            longitude: lon.toString(),
            daily: 'snowfall_sum,temperature_2m_max,temperature_2m_min',
            hourly: 'wind_speed_10m,snow_depth,weather_code',
            timezone: 'auto',
            forecast_days: '3',
            ...(elev !== undefined ? { elevation: elev.toString() } : {})
        });

        const fetchForecast = async (elev?: number) => {
            const query = new URLSearchParams(buildParams(elev)).toString();
            const response = await fetch(`${BASE_URL}?${query}`);
            return response.json();
        };

        try {
            const [peakData, baseData] = await Promise.all([
                fetchForecast(peakElevation),
                baseElevation !== undefined ? fetchForecast(baseElevation) : Promise.resolve(null)
            ]);

            if (!peakData.daily || !peakData.hourly) return null;

            const forecast: WeatherData[] = [];
            for (let i = 0; i < 3; i++) {
                const hIdx = 12 + (i * 24);
                forecast.push({
                    snowfall: peakData.daily.snowfall_sum[i] || 0,
                    tempMax: peakData.daily.temperature_2m_max[i],
                    tempMin: peakData.daily.temperature_2m_min[i],
                    windSpeed: peakData.hourly.wind_speed_10m[hIdx],
                    snowDepth: Math.round((peakData.hourly.snow_depth[hIdx] || 0) * 100),
                    baseSnowDepth: baseData?.hourly?.snow_depth ? Math.round((baseData.hourly.snow_depth[hIdx] || 0) * 100) : undefined,
                    weatherCode: peakData.hourly.weather_code[hIdx],
                });
            }
            return forecast;
        } catch (error) {
            console.error('Failed to fetch weather data:', error);
            return null;
        }
    }
}
