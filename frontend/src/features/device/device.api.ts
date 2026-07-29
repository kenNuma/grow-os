import { apiClient } from "../../shared/api/client";
import type { Device, CreateDeviceData, UpdateDeviceData, } from "./device.types";

export function getDevices(): Promise<Device[]> {
    return apiClient<Device[]>("/devices");
}

export function getDeviceByKey(deviceKey: string): Promise<Device> {
    return apiClient<Device>(`/devices/${deviceKey}`);
}

export function createDevice(data: CreateDeviceData): Promise<Device> {
    return apiClient<Device>("/devices", {
        method: "POST",
        body: data,
    });
}

export function updateDevice(data: UpdateDeviceData, deviceKey: string): Promise<Device> {
    return apiClient<Device>(`/devices/${deviceKey}`, {
        method: "PATCH",
        body: data,
    });
}

export function deleteDevice(deviceKey: string): Promise<Device> {
    return apiClient<Device>(`/devices/${deviceKey}`, {
        method: "DELETE",
    });
}