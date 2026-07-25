import { apiClient } from "../../shared/api/client";
import type { Device } from "./device.types";

export function getDevices(): Promise<Device[]> {
    return apiClient<Device[]>("/devices");
}