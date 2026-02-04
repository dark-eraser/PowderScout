import { SkiResort } from './types';
export declare class SkiStationService {
    private static resorts;
    static fetchResorts(): Promise<SkiResort[]>;
    static getNearbyResorts(lat: number, lon: number, radiusKm?: number): SkiResort[];
    private static calculateDistance;
}
//# sourceMappingURL=SkiStationService.d.ts.map