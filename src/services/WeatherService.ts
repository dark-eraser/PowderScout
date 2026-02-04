import { WeatherData } from './types';

const BASE_URL = 'https://api.open-meteo.com/v1/forecast';

export class WeatherService {
    static async getForecast(lat: number, lon: number, elevation?: number): Promise<WeatherData[] | null> {
        const params: any = {
            latitude: lat.toString(),
            longitude: lon.toString(),
            daily: 'snowfall_sum,temperature_2m_max,temperature_2m_min',
            hourly: 'wind_speed_10m,snow_depth,weather_code',
            timezone: 'auto',
            forecast_days: '3',
        };

        if (elevation !== undefined) {
            params.elevation = elevation.toString();
        }

        const query = new URLSearchParams(params).toString();

        try {
            const response = await fetch(`${BASE_URL}?${query}`);
            const data = await response.json();

            if (!data.daily || !data.hourly) return null;

            const forecast: WeatherData[] = [];
            for (let i = 0; i < 3; i++) {
                // Noon indices: 12, 36, 60
                const hIdx = 12 + (i * 24);
                forecast.push({
                    snowfall: data.daily.snowfall_sum[i] || 0,
                    tempMax: data.daily.temperature_2m_max[i],
                    tempMin: data.daily.temperature_2m_min[i],
                    windSpeed: data.hourly.wind_speed_10m[hIdx],
                    snowDepth: Math.round((data.hourly.snow_depth[hIdx] || 0) * 100),
                    weatherCode: data.hourly.weather_code[hIdx],
                });
            }
            return forecast;
        } catch (error) {
            console.error('Failed to fetch weather data:', error);
            return null;
        }
    }
}
