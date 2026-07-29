import type { Telemetry } from "../../telemetry/telemetry.types";
import type { Device } from "../device.types";

import DeviceCard from "./DeviceCard";

import "./DeviceList.css";

type DeviceListProps = {
    devices: Device[];
    telemetryByDeviceKey: Record<string, Telemetry | null>;
};

function DeviceList({
    devices,
    telemetryByDeviceKey,
}: DeviceListProps) {
    if (devices.length === 0) {
        return (
            <p className="device-list__empty">
                登録されているデバイスはありません。
            </p>
        );
    }

    return (
        <section
            className="device-list"
            aria-label="登録デバイス一覧"
        >
            {devices.map((device) => (
                <DeviceCard
                    key={device.id}
                    device={device}
                    telemetry={
                        telemetryByDeviceKey[device.deviceKey] ?? null
                    }
                />
            ))}
        </section>
    );
}

export default DeviceList;