import { apiClient } from "../../shared/api/client";
import type { Device } from "./device.types";

export function getDevices(): Promise<Device[]> {
    return apiClient<Device[]>("/devices");
}

export function getDeviceByKey(deviceKey: string): Promise<Device> {
    return apiClient<Device>(`/devices/${deviceKey}`);
}