import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import type { Telemetry } from "../../telemetry/telemetry.types";
import type { Device } from "../device.types";
import { isDeviceOnline } from "../device-status";

import { calculateVPD } from "../../../shared/calculations/calculateVPD";
import { getHumidityStatus } from "../../../shared/calculations/getHumidityStatus";
import { getOverallEnvironmentStatus } from "../../../shared/calculations/getOverallEnvironmentStatus";
import { getTemperatureStatus } from "../../../shared/calculations/getTemperatureStatus";
import { getVPDStatus } from "../../../shared/calculations/getVPDStatus";

import "./DeviceCard.css";

type DeviceCardProps = {
    device: Device;
    telemetry: Telemetry | null;
};

function DeviceCard({
    device,
    telemetry,
}: DeviceCardProps) {
    const [currentTime, setCurrentTime] = useState(Date.now());

    const isOnline = isDeviceOnline(
        device.lastSeenAt,
        currentTime,
    );

    const overallStatus = telemetry
        ? getOverallEnvironmentStatus([
            getTemperatureStatus(telemetry.temperature),
            getHumidityStatus(telemetry.humidity),
            getVPDStatus(
                calculateVPD(
                    telemetry.temperature,
                    telemetry.humidity,
                ),
            ),
        ]) : null;

    useEffect(() => {
        const timer = window.setInterval(() => {
            setCurrentTime(Date.now());
        }, 5000);

        return () => {
            window.clearInterval(timer);
        };
    }, []);

    return (
        <Link
            className="device-card__link"
            to={`/devices/${device.deviceKey}`}
            aria-label={`${device.name}の詳細を表示`}
        >
            <article className="device-card">
                <header className="device-card__header">
                    <div>
                        <h2 className="device-card__name">
                            {device.name}
                        </h2>

                        <p className="device-card__key">
                            {device.deviceKey}
                        </p>
                    </div>

                    <div className="device-card__statuses">
                        <span
                            className={`device-card__status ${isOnline
                                    ? "device-card__status--online"
                                    : "device-card__status--offline"
                                }`}
                        >
                            {isOnline ? "online" : "offline"}
                        </span>

                        {overallStatus && (
                            <span
                                className={`device-card__environment-status device-card__environment-status--${overallStatus.variant}`}
                            >
                                {overallStatus.label}
                            </span>
                        )}
                    </div>
                </header>

                <dl className="device-card__metrics">
                    <div className="device-card__metric">
                        <dt className="device-card__label">
                            温度
                        </dt>

                        <dd className="device-card__value">
                            {telemetry ? (
                                <>
                                    <span className="device-card__number">
                                        {telemetry.temperature}
                                    </span>

                                    <span className="device-card__unit">
                                        ℃
                                    </span>
                                </>
                            ) : (
                                "-"
                            )}
                        </dd>
                    </div>

                    <div className="device-card__metric">
                        <dt className="device-card__label">
                            湿度
                        </dt>

                        <dd className="device-card__value">
                            {telemetry ? (
                                <>
                                    <span className="device-card__number">
                                        {telemetry.humidity}
                                    </span>

                                    <span className="device-card__unit">
                                        %
                                    </span>
                                </>
                            ) : (
                                "-"
                            )}
                        </dd>
                    </div>

                    <div className="device-card__metric">
                        <dt className="device-card__label">
                            気圧
                        </dt>

                        <dd className="device-card__value">
                            {telemetry?.pressure != null ? (
                                <>
                                    <span className="device-card__number">
                                        {telemetry.pressure.toFixed(1)}
                                    </span>

                                    <span className="device-card__unit">
                                        hPa
                                    </span>
                                </>
                            ) : (
                                "-"
                            )}
                        </dd>
                    </div>
                </dl>

                <footer className="device-card__footer">
                    <p className="device-card__time">
                        最終計測：
                        {telemetry
                            ? new Date(
                                telemetry.recordedAt,
                            ).toLocaleString("ja-JP")
                            : "データなし"}
                    </p>
                </footer>
            </article>
        </Link>
    );
}

export default DeviceCard;