import type { Device } from "../device.types";
import DeviceCard from "./DeviceCard";
import "./DeviceList.css";

type DeviceListProps = {
    devices: Device[];
};

function DeviceList({ devices }: DeviceListProps) {
    if (devices.length === 0) {
        return (
            <p className="device-list__empty">
                登録されているデバイスはありません。
            </p>
        );
    }

    return (
        <section className="device-list" aria-label="登録デバイス一覧">
            {devices.map((device) => (
                <DeviceCard key={device.id} device={device} />
            ))}
        </section>
    );
}

export default DeviceList;