const GEO_URL = 'https://geocoding-api.open-meteo.com/v1/search';
export class GeocodingService {
    static async search(name) {
        const params = new URLSearchParams({
            name,
            count: '5',
            language: 'en',
            format: 'json',
        });
        try {
            const response = await fetch(`${GEO_URL}?${params.toString()}`);
            const data = await response.json();
            if (!data.results)
                return [];
            return data.results.map((r) => ({
                name: r.name,
                latitude: r.latitude,
                longitude: r.longitude,
                country: r.country,
                admin1: r.admin1,
            }));
        }
        catch (error) {
            console.error('Geocoding search failed:', error);
            return [];
        }
    }
}
//# sourceMappingURL=GeocodingService.js.map