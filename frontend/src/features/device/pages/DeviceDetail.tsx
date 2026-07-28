import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import "./DeviceDetail.css";

import { getDeviceByKey } from "../device.api";
import type { Device } from "../device.types";

import { getLatestTelemetry, getTelemetryHistory } from "../../telemetry/telemetry.api";
import type { Telemetry } from "../../telemetry/telemetry.types";

import {
    CartesianGrid,
    Legend,
    Line,
    LineChart,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from "recharts";

//backend シミュレーター用のコマンド　DEVICE_KEY=ESP32-001 npm run simulate:telemetry
function DeviceDetail() {
    const { deviceKey } = useParams<{ deviceKey: string }>();

    const [device, setDevice] = useState<Device | null>(null);
    const [telemetry, setTelemetry] = useState<Telemetry | null>(null);
    const [telemetryHistory, setTelemetryHistory] = useState<Telemetry[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    async function fetchDevice(key: string, showLowding = false) {
        try {
            if(showLowding) {
                setLoading(true);
            }
            setError(null);

            const [deviceData, telemetryData, telemetryHistory] =
                await Promise.all([
                    getDeviceByKey(key),
                    getLatestTelemetry(key),
                    getTelemetryHistory(key, 12),
                ]);

            setDevice(deviceData);
            setTelemetry(telemetryData);
            setTelemetryHistory(telemetryHistory);
        } catch (error) {
            console.error(error);
            setError("Failed to load device information.");
        } finally {
            if (showLowding) {
                setLoading(false);
            }
        }
    }

    useEffect(() => {
        if (!deviceKey) {
            setError("Device key is missing.");
            setLoading(false);
            return;
        }
        const key = deviceKey;

        fetchDevice(key, true);

        // const timer = setInterval(() => {
        //     fetchDevice(key);
        // }, 5000);

        return () => {
            // clearInterval(timer);
        };
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


    const chartData = [...telemetryHistory]
        .reverse()
        .map((item) => ({
            recordedAt: new Date(item.recordedAt).toLocaleString(
                "ja-JP",
                {
                    // month: "2-digit",
                    // day: "2-digit",
                    hour: "2-digit",
                    minute: "2-digit",
                    second: "2-digit"
                },
            ),
            temperature: item.temperature,
            humidity: item.humidity,
        }));

    console.log(telemetryHistory);
    console.log(chartData);

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

                <article className="device-detail__panel">
                    <div className="device-detail__panel-header">
                        <div>
                            <p className="device-detail__panel-eyebrow">
                                Current Conditions
                            </p>

                            <h2 className="device-detail__panel-title">
                                Environment
                            </h2>
                        </div>
                    </div>

                    <div className="device-detail__details">
                        <div className="device-detail__row">
                            <span className="device-detail__label">
                                Temperature
                            </span>

                            <span className="device-detail__value">
                                {telemetry
                                    ? `${telemetry.temperature} °C`
                                    : "No data"}
                            </span>
                        </div>

                        <div className="device-detail__row">
                            <span className="device-detail__label">
                                Humidity
                            </span>

                            <span className="device-detail__value">
                                {telemetry
                                    ? `${telemetry.humidity} %`
                                    : "No data"}
                            </span>
                        </div>

                        <div className="device-detail__row">
                            <span className="device-detail__label">
                                Recorded At
                            </span>

                            <span className="device-detail__value">
                                {telemetry
                                    ? new Date(
                                        telemetry.recordedAt,
                                    ).toLocaleString("ja-JP")
                                    : "No data"}
                            </span>
                        </div>
                    </div>
                </article>
                <article className="device-detail__panel device-detail__panel--wide">
                    <div className="device-detail__panel-header">
                        <div>
                            <p className="device-detail__panel-eyebrow">
                                Historical Data
                            </p>

                            <h2 className="device-detail__panel-title">
                                Telemetry Graph
                            </h2>
                        </div>
                    </div>

                    {chartData.length > 0 ? (
                        <div className="device-detail__chart">
                            <ResponsiveContainer
                                width="100%"
                                height="100%"
                            >
                                <LineChart
                                    data={chartData}
                                    margin={{
                                        top: 16,
                                        right: 16,
                                        left: 0,
                                        bottom: 8,
                                    }}
                                >
                                    <CartesianGrid strokeDasharray="3 3" />

                                    <XAxis
                                        dataKey="recordedAt"
                                        tick={false}
                                        minTickGap={60}
                                    />

                                    <YAxis
                                        yAxisId="temperature"
                                        domain={["dataMin - 1", "dataMax + 1"]}
                                        tickFormatter={(value) => `${value}°`}
                                    />

                                    <YAxis
                                        yAxisId="humidity"
                                        orientation="right"
                                        domain={["dataMin - 5", "dataMax + 5"]}
                                        tickFormatter={(value) => `${value}%`}
                                    />

                                    <Tooltip
                                        formatter={(value, name) => {
                                            if (name === "Temperature") {
                                                return [`${value} °C`, name];
                                            }

                                            return [`${value} %`, name];
                                        }}
                                    />

                                    <Legend />

                                    <Line
                                        yAxisId="temperature"
                                        type="monotone"
                                        dataKey="temperature"
                                        name="Temperature"
                                        stroke="#f97316"
                                        strokeWidth={2}
                                        dot={{ r: 3 }}
                                        activeDot={{ r: 5 }}
                                    />

                                    <Line
                                        yAxisId="humidity"
                                        type="monotone"
                                        dataKey="humidity"
                                        name="Humidity"
                                        stroke="#0ea5e9"
                                        strokeWidth={2}
                                        dot={{ r: 3 }}
                                        activeDot={{ r: 5 }}
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    ) : (
                        <p className="device-detail__description">
                            No telemetry history is available.
                        </p>
                    )}
                </article>
            </div>
        </section>
    );
}

export default DeviceDetail;