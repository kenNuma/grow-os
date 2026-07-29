import { useEffect, useState } from "react";

import DashboardSummary from "../components/DashboardSummary";
import DeviceList from "../../device/components/DeviceList";

import { getDevices } from "../../device/device.api";
import { isDeviceOnline } from "../../device/device-status";
import type { Device } from "../../device/device.types";

import { getLatestTelemetry } from "../../telemetry/telemetry.api";
import type { Telemetry } from "../../telemetry/telemetry.types";

import "./Dashboard.css";

function Dashboard() {
    const [devices, setDevices] = useState<Device[]>([]);
    const [telemetryByDeviceKey, setTelemetryByDeviceKey] =
        useState<Record<string, Telemetry | null>>({});

    const [isLoading, setIsLoading] = useState(true);
    const [errorMessage, setErrorMessage] =
        useState<string | null>(null);

    const [currentTime, setCurrentTime] = useState(Date.now());

    useEffect(() => {
        let isMounted = true;

        async function fetchDashboardData(
            showLoading = false,
        ) {
            try {
                if (showLoading) {
                    setIsLoading(true);
                }

                const deviceData = await getDevices();

                const telemetryResults =
                    await Promise.allSettled(
                        deviceData.map((device) =>
                            getLatestTelemetry(
                                device.deviceKey,
                            ),
                        ),
                    );

                if (!isMounted) {
                    return;
                }

                const nextTelemetryByDeviceKey:
                    Record<string, Telemetry | null> = {};

                deviceData.forEach((device, index) => {
                    const result = telemetryResults[index];

                    nextTelemetryByDeviceKey[
                        device.deviceKey
                    ] =
                        result.status === "fulfilled"
                            ? result.value
                            : null;
                });

                setDevices(deviceData);
                setTelemetryByDeviceKey(
                    nextTelemetryByDeviceKey,
                );
                setCurrentTime(Date.now());
                setErrorMessage(null);
            } catch (error) {
                console.error(error);

                if (isMounted) {
                    setErrorMessage(
                        "ダッシュボード情報の取得に失敗しました。",
                    );
                }
            } finally {
                if (showLoading && isMounted) {
                    setIsLoading(false);
                }
            }
        }

        fetchDashboardData(true);

        const timer = window.setInterval(() => {
            fetchDashboardData();
        }, 5000);

        return () => {
            isMounted = false;
            window.clearInterval(timer);
        };
    }, []);

    const onlineDevices = devices.filter((device) =>
        isDeviceOnline(
            device.lastSeenAt,
            currentTime,
        ),
    ).length;

    const latestTelemetryList = Object.values(
        telemetryByDeviceKey,
    ).filter(
        (telemetry): telemetry is Telemetry =>
            telemetry !== null,
    );

    const averageTemperature =
        latestTelemetryList.length > 0
            ? latestTelemetryList.reduce(
                (total, telemetry) =>
                    total + telemetry.temperature,
                0,
            ) / latestTelemetryList.length
            : null;

    const averageHumidity =
        latestTelemetryList.length > 0
            ? latestTelemetryList.reduce(
                (total, telemetry) =>
                    total + telemetry.humidity,
                0,
            ) / latestTelemetryList.length
            : null;

    return (
        <main className="dashboard">
            <div className="dashboard__container">
                <header className="dashboard__header">
                    <h1 className="dashboard__title">
                        GrowOS Dashboard
                    </h1>

                    <p className="dashboard__description">
                        植物の状態をリアルタイムで監視します
                    </p>
                </header>

                {isLoading && (
                    <p className="dashboard__message">
                        デバイス情報を読み込んでいます...
                    </p>
                )}

                {errorMessage && (
                    <p className="dashboard__message dashboard__message--error">
                        {errorMessage}
                    </p>
                )}

                <DashboardSummary
                    totalDevices={devices.length}
                    onlineDevices={onlineDevices}
                    averageTemperature={averageTemperature}
                    averageHumidity={averageHumidity}
                />

                <section className="dashboard__devices">
                    <div className="dashboard__section-header">
                        <div>
                            <h2 className="dashboard__section-title">
                                Devices
                            </h2>

                            <p className="dashboard__section-description">
                                登録されているデバイスの現在状態
                            </p>
                        </div>
                    </div>

                    {!isLoading && !errorMessage && (
                        <DeviceList
                            devices={devices}
                            telemetryByDeviceKey={
                                telemetryByDeviceKey
                            }
                        />
                    )}
                </section>
            </div>
        </main>
    );
}

export default Dashboard;