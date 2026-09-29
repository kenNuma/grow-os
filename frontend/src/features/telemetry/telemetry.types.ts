export interface Telemetry {
    id: string;
    deviceId: string;
    temperature: number;
    humidity: number;
    pressure: number | null;
    waterTemperature: number | null;
    recordedAt: string;
}