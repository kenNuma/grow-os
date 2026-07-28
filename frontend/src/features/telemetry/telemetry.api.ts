import { apiClient } from "../../shared/api/client";
import type { Telemetry } from "./telemetry.types";

export function getLatestTelemetry(deviceKey: string): Promise<Telemetry> {
    return apiClient<Telemetry>(
        `/telemetry/latest/${encodeURIComponent(deviceKey)}`,
    );
}

export function getTelemetryHistory(deviceKey: string, limit = 100): Promise<Telemetry[]> {
        const params = new URLSearchParams({
        limit: String(limit),
    });
    return apiClient<Telemetry[]>(
        `/telemetry/history/${encodeURIComponent(deviceKey)}?${params.toString()}`,
    );
}