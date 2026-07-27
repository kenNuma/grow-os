import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import "./DeviceDetail.css";

import { getDeviceByKey } from "../device.api";
import type { Device } from "../device.types";

function DeviceDetail() {
    const { deviceKey } = useParams<{ deviceKey: string }>();

    const [device, setDevice] = useState<Device | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!deviceKey) {
            setError("Device key is missing.");
            setLoading(false);
            return;
        }

        const key = deviceKey;

        async function fetchDevice() {
            try {
                setLoading(true);
                setError(null);

                const data = await getDeviceByKey(key);
                setDevice(data);
            } catch (error) {
                console.error(error);
                setError("Failed to load device information.");
            } finally {
                setLoading(false);
            }
        }

        fetchDevice();
    }, [deviceKey]);

    if (loading) {
        return <p>Loading...</p>;
    }

    if (error) {
        return <p>{error}</p>;
    }

    if (!device) {
        return <p>Device not found.</p>;
    }

    return (
        <section className="device-detail">
            <div className="device-detail__header">
                <div>
                    <p className="device-detail__eyebrow">
                        Device Management
                    </p>

                    <h1 className="device-detail__title">
                        {device.name}
                    </h1>
                </div>
            </div>

            <div className="device-detail__content">
                <article className="device-detail__panel">
                    <div className="device-detail__panel-header">
                        <div>
                            <p className="device-detail__panel-eyebrow">
                                Device Information
                            </p>
                            <h2 className="device-detail__panel-title">
                                Basic Information
                            </h2>
                        </div>
                    </div>

                    <div className="device-detail__details">
                        <div className="device-detail__row">
                            <span className="device-detail__label">
                                Device Key
                            </span>

                            <span className="device-detail__value">
                                {device.deviceKey}
                            </span>
                        </div>

                        <div className="device-detail__row">
                            <span className="device-detail__label">
                                Last Seen
                            </span>

                            <span className="device-detail__value">
                                {device.lastSeenAt ?? "No data"}
                            </span>
                        </div>
                    </div>
                </article>

                <article className="device-detail__panel">
                    <div className="device-detail__panel-header">
                        <div>
                            <p className="device-detail__panel-eyebrow">
                                Connection
                            </p>
                            <h2 className="device-detail__panel-title">
                                Device Status
                            </h2>
                        </div>

                        <span
                            className={`device-detail__status device-detail__status--${device.status}`}
                        >
                            {device.status}
                        </span>
                    </div>

                    <p className="device-detail__description">
                        {device.status === "online"
                            ? "This device is currently connected and available."
                            : "This device is currently disconnected."}
                    </p>
                </article>
            </div>
        </section>
    );
}

export default DeviceDetail;