import { apiClient } from "../../shared/api/client";
import type { Telemetry } from "./telemetry.types";

export function getLatestTelemetry(deviceKey: string): Promise<Telemetry> {
    return apiClient<Telemetry>(
        `/telemetry/latest/${encodeURIComponent(deviceKey)}`,
    );
}