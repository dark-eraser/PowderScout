const SKI_AREAS_URL = 'https://tiles.openskimap.org/geojson/ski_areas.geojson';
export class SkiStationService {
    static resorts = [];
    static async fetchResorts() {
        if (this.resorts.length > 0)
            return this.resorts;
        try {
            // Try to load from cache first
            if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
                const cached = await chrome.storage.local.get('ski_resorts');
                if (cached.ski_resorts && Array.isArray(cached.ski_resorts) && cached.ski_resorts.length > 0) {
                    // Cache validation: ensure the first resort has required new properties
                    if ('liftCount' in cached.ski_resorts[0] && 'website' in cached.ski_resorts[0] && 'peakElevation' in cached.ski_resorts[0] && 'baseElevation' in cached.ski_resorts[0]) {
                        this.resorts = cached.ski_resorts;
                        return this.resorts;
                    }
                    else {
                        console.log('Stale cache detected (missing baseElevation), clearing...');
                        await chrome.storage.local.remove('ski_resorts');
                    }
                }
            }
            const response = await fetch(SKI_AREAS_URL);
            if (!response.ok)
                throw new Error(`HTTP error! status: ${response.status}`);
            const data = await response.json();
            this.resorts = data.features
                .filter((f) => (f.properties.type === 'skiArea' || f.properties.type === 'station') && f.geometry?.type === 'Point')
                .map((f) => {
                const liftStats = f.properties.statistics?.lifts?.byType || {};
                const liftCount = Object.values(liftStats).reduce((sum, type) => sum + (type.count || 0), 0);
                const liftBreakdown = {};
                Object.entries(liftStats).forEach(([type, data]) => {
                    if (data.count > 0)
                        liftBreakdown[type] = data.count;
                });
                // Extract peak elevation (highest maxElevation among all lift types)
                const peakElevation = Object.values(liftStats).reduce((max, type) => {
                    return Math.max(max, type.maxElevation || 0);
                }, 0);
                // Extract base elevation (lowest minElevation among all lift types)
                const elevations = Object.values(liftStats).map((type) => type.minElevation).filter(e => e !== undefined && e > 0);
                const baseElevation = elevations.length > 0 ? Math.min(...elevations) : (peakElevation > 0 ? peakElevation - 500 : undefined);
                return {
                    id: f.properties.id,
                    name: f.properties.name || "Unknown Resort",
                    latitude: f.geometry.coordinates[1],
                    longitude: f.geometry.coordinates[0],
                    liftCount: liftCount,
                    liftBreakdown,
                    website: f.properties.websites?.[0],
                    peakElevation: peakElevation > 0 ? Math.round(peakElevation) : undefined,
                    baseElevation: baseElevation ? Math.round(baseElevation) : undefined,
                };
            })
                .filter((r) => r.name !== "Unknown Resort" && r.liftCount > 10);
            // Cache the results
            if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
                chrome.storage.local.set({ 'ski_resorts': this.resorts });
            }
            return this.resorts;
        }
        catch (error) {
            console.error('Failed to fetch ski resorts:', error);
            return [];
        }
    }
    static getNearbyResorts(lat, lon, radiusKm = 100) {
        return this.resorts
            .map(resort => ({
            ...resort,
            distance: this.calculateDistance(lat, lon, resort.latitude, resort.longitude),
        }))
            .filter(resort => resort.distance <= radiusKm)
            .sort((a, b) => (a.distance || 0) - (b.distance || 0));
    }
    static calculateDistance(lat1, lon1, lat2, lon2) {
        const R = 6371; // Earth's radius in km
        const dLat = (lat2 - lat1) * Math.PI / 180;
        const dLon = (lon2 - lon1) * Math.PI / 180;
        const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
                Math.sin(dLon / 2) * Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    }
}
//# sourceMappingURL=SkiStationService.js.map