export interface Device {
    id: string;
    name: string;
    deviceKey: string;
    status: string;
    lastSeenAt: string | null;
    createdAt: string;
    updatedAt: string;
}

export interface CreateDeviceData {
    name: string;
    deviceKey: string;
}

export type UpdateDeviceData = {
    name: string;
};