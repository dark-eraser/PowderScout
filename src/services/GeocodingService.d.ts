export interface LocationResult {
    name: string;
    latitude: number;
    longitude: number;
    country?: string;
    admin1?: string;
}
export declare class GeocodingService {
    static search(name: string): Promise<LocationResult[]>;
}
//# sourceMappingURL=GeocodingService.d.ts.map