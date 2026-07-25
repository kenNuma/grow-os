import type { Device } from "../device.types";
import DeviceCard from "./DeviceCard";

type DeviceListProps = {
    devices: Device[];
};

function DeviceList({ devices }: DeviceListProps) {
    if (devices.length === 0) {
        return <p>登録されているデバイスはありません。</p>;
    }

    return (
        <section>
            {devices.map((device) => (
                <DeviceCard key={device.id} device={device} />
            ))}
        </section>
    );
}

export default DeviceList;