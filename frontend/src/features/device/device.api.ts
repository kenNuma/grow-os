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

type ControlDeviceData = {
    target: string;
    action: string;
};

export function controlDevice( deviceKey: string, data: ControlDeviceData,): Promise<void> {
    return apiClient<void>(
        `/devices/${deviceKey}/control`,
        {
            method: "POST",
            body: data,
        },
    );
}

export type ControlState = {
    led: boolean;
    fan: boolean;
};

export function getControlState(deviceKey: string): Promise<ControlState> {
    return apiClient<ControlState>(
        `/devices/${deviceKey}/control-state`,
        {
            method: 'GET',
        },
    );
}