import { ScoredResort, WeatherData } from '../services/types';

export class RankingEngine {
    static scoreResort(resort: ScoredResort): number {
        if (!resort.weather) return 0;

        const { snowfall, windSpeed, weatherCode, snowDepth } = resort.weather;
        const { liftCount } = resort;

        let score = 0;

        // 1. Lift Count - Scale factor for resort size (new weighting)
        score += Math.min(liftCount * 2, 40); // Up to 40 points for 20+ lifts

        // 2. Snowfall (Recent/Predicted) - High weight
        score += Math.min(snowfall * 10, 50); // Up to 50 points for 5cm+ snow

        // 3. Snow Depth - Base condition (snowDepth is now in cm)
        score += Math.min(snowDepth * 0.1, 20); // Up to 20 points for 200cm base

        // 4. Wind Speed - Penalty
        if (windSpeed > 40) score -= 30; // Strong winds
        else if (windSpeed > 20) score -= 10; // Moderate winds

        // 5. Weather Condition (WMO Codes) - Sunshine focus
        if (weatherCode === 0) score += 50; // Perfectly clear sky
        else if (weatherCode <= 3) score += 30; // Partly cloudy/clear
        else if (weatherCode >= 71 && weatherCode <= 77) score += 20; // Snowing! bonus

        return Math.max(0, score);
    }

    static rankResorts(resorts: ScoredResort[]): ScoredResort[] {
        return resorts
            .map(r => ({ ...r, score: this.scoreResort(r) }))
            .sort((a, b) => (b.score || 0) - (a.score || 0));
    }
}
