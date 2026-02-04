import { WeatherData } from './types';

const BASE_URL = 'https://api.open-meteo.com/v1/forecast';

export class WeatherService {
    static async getForecast(lat: number, lon: number, elevation?: number): Promise<WeatherData | null> {
        const params: any = {
            latitude: lat.toString(),
            longitude: lon.toString(),
            daily: 'snowfall_sum,temperature_2m_max,temperature_2m_min',
            hourly: 'wind_speed_10m,snow_depth,weather_code',
            timezone: 'auto',
            forecast_days: '1',
        };

        if (elevation !== undefined) {
            params.elevation = elevation.toString();
        }

        const query = new URLSearchParams(params).toString();

        try {
            const response = await fetch(`${BASE_URL}?${query}`);
            const data = await response.json();

            if (!data.daily || !data.hourly) return null;

            return {
                snowfall: data.daily.snowfall_sum[0] || 0,
                tempMax: data.daily.temperature_2m_max[0],
                tempMin: data.daily.temperature_2m_min[0],
                windSpeed: data.hourly.wind_speed_10m[0], // Current hour
                snowDepth: Math.round((data.hourly.snow_depth[0] || 0) * 100), // Convert meters to cm and round up
                weatherCode: data.hourly.weather_code[0],
            };
        } catch (error) {
            console.error('Failed to fetch weather data:', error);
            return null;
        }
    }
}
