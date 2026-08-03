export interface Telemetry {
    id: string;
    deviceId: string;
    temperature: number;
    humidity: number;
    pressure: number | null;
    recordedAt: string;
}