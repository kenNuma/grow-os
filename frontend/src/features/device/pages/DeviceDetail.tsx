import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import "./DeviceDetail.css";

import { getDeviceByKey, updateDevice, deleteDevice } from "../device.api";
import { isDeviceOnline } from "../device-status";
import type { Device } from "../device.types";

import {
    getLatestTelemetry,
    getTelemetryHistory,
} from "../../telemetry/telemetry.api";
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

// backend シミュレーター用のコマンド
// DEVICE_KEY=ESP32-001 npm run simulate:telemetry
function DeviceDetail() {
    const navigate = useNavigate();
    const { deviceKey } = useParams<{ deviceKey: string }>();

    const [device, setDevice] = useState<Device | null>(null);
    const [telemetry, setTelemetry] = useState<Telemetry | null>(null);
    const [telemetryHistory, setTelemetryHistory] = useState<Telemetry[]>([]);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [isEditing, setIsEditing] = useState(false);
    const [editingName, setEditingName] = useState("");
    const [isSaving, setIsSaving] = useState(false);
    const [editError, setEditError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    const [isDeleting, setIsDeleting] = useState(false);
    const [deleteError, setDeleteError] = useState<string | null>(null);

    async function fetchDevice(
        key: string,
        showLoading = false,
    ) {
        try {
            if (showLoading) {
                setLoading(true);
            }

            setError(null);

            const [
                deviceData,
                telemetryData,
                telemetryHistoryData,
            ] = await Promise.all([
                getDeviceByKey(key),
                getLatestTelemetry(key),
                getTelemetryHistory(key, 12),
            ]);

            setDevice(deviceData);
            setTelemetry(telemetryData);
            setTelemetryHistory(telemetryHistoryData);
        } catch (error) {
            console.error(error);
            setError("Failed to load device information.");
        } finally {
            if (showLoading) {
                setLoading(false);
            }
        }
    }

    function startEditing() {
        if (!device) {
            return;
        }

        setEditingName(device.name);
        setEditError(null);
        setSuccessMessage(null);
        setIsEditing(true);
    }

    function cancelEditing() {
        setEditingName("");
        setEditError(null);
        setIsEditing(false);
    }

    async function saveDeviceName() {
        if (!deviceKey) {
            return;
        }

        const trimmedName = editingName.trim();

        if (!trimmedName) {
            setEditError("Device name is required.");
            return;
        }

        if (trimmedName === device?.name) {
            cancelEditing();
            return;
        }

        try {
            setIsSaving(true);
            setEditError(null);

            const updatedDevice = await updateDevice({
                name: trimmedName,
            }, deviceKey);

            setDevice(updatedDevice);
            setEditingName("");
            setIsEditing(false);
            setSuccessMessage("Device name was updated.");
        } catch (error) {
            console.error(error);
            setEditError("Failed to update device name.");
        } finally {
            setIsSaving(false);
        }
    }

    async function handleDeleteDevice() {
        if (!deviceKey || !device) {
            return;
        }

        const confirmed = window.confirm(
            `「${device.name}」を削除しますか？\n\nこの操作は取り消せません。`,
        );

        if (!confirmed) {
            return;
        }

        try {
            setIsDeleting(true);
            setDeleteError(null);

            await deleteDevice(deviceKey);

            navigate("/");
        } catch (error) {
            console.error(error);
            setDeleteError("Failed to delete device.");
        } finally {
            setIsDeleting(false);
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

        const timer = setInterval(() => {
            fetchDevice(key);
        }, 5000);

        return () => {
            clearInterval(timer);
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

    const isOnline = isDeviceOnline(device.lastSeenAt);

    const chartData = [...telemetryHistory]
        .reverse()
        .map((item) => ({
            recordedAt: new Date(
                item.recordedAt,
            ).toLocaleString("ja-JP", {
                hour: "2-digit",
                minute: "2-digit",
                second: "2-digit",
            }),
            temperature: item.temperature,
            humidity: item.humidity,
        }));

    return (
        <section className="device-detail">
            <div className="device-detail__header">
                <div>
                    <p className="device-detail__eyebrow">
                        Device Management
                    </p>

                    {isEditing ? (
                        <div className="device-detail__edit">
                            <input
                                className="device-detail__name-input"
                                type="text"
                                value={editingName}
                                onChange={(event) => {
                                    setEditingName(event.target.value);
                                }}
                                onKeyDown={(event) => {
                                    if (event.key === "Enter") {
                                        saveDeviceName();
                                    }

                                    if (event.key === "Escape") {
                                        cancelEditing();
                                    }
                                }}
                                disabled={isSaving}
                                autoFocus
                            />

                            <div className="device-detail__edit-actions">
                                <button
                                    className="device-detail__button device-detail__button--primary"
                                    type="button"
                                    onClick={saveDeviceName}
                                    disabled={isSaving}
                                >
                                    {isSaving ? "Saving..." : "Save"}
                                </button>

                                <button
                                    className="device-detail__button device-detail__button--secondary"
                                    type="button"
                                    onClick={cancelEditing}
                                    disabled={isSaving}
                                >
                                    Cancel
                                </button>
                            </div>

                            {editError && (
                                <p className="device-detail__edit-error">
                                    {editError}
                                </p>
                            )}
                        </div>
                    ) : (
                        <div className="device-detail__title-row">
                            <h1 className="device-detail__title">
                                {device.name}
                            </h1>

                            <button
                                className="device-detail__button device-detail__button--secondary"
                                type="button"
                                onClick={startEditing}
                            >
                                Edit
                            </button>

                            <button
                                className="device-detail__button device-detail__button--danger"
                                type="button"
                                onClick={handleDeleteDevice}
                                disabled={isDeleting}
                            >
                                {isDeleting ? "Deleting..." : "Delete"}
                            </button>

                            {successMessage && (
                                <p className="device-detail__success">
                                    {successMessage}
                                </p>
                            )}

                            {deleteError && (
                                <p className="device-detail__delete-error">
                                    {deleteError}
                                </p>
                            )}
                        </div>

                    )}
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
                                {device.lastSeenAt
                                    ? new Date(
                                        device.lastSeenAt,
                                    ).toLocaleString("ja-JP")
                                    : "No data"}
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
                            className={`device-detail__status ${isOnline
                                ? "device-detail__status--online"
                                : "device-detail__status--offline"
                                }`}
                        >
                            {isOnline ? "online" : "offline"}
                        </span>
                    </div>

                    <p className="device-detail__description">
                        {isOnline
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
                                Pressure
                            </span>

                            <span className="device-detail__value">
                                {telemetry?.pressure != null
                                    ? `${telemetry.pressure.toFixed(1)} hPa`
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
                                        domain={[
                                            "dataMin - 1",
                                            "dataMax + 1",
                                        ]}
                                        tickFormatter={(value) =>
                                            `${value}°`
                                        }
                                    />

                                    <YAxis
                                        yAxisId="humidity"
                                        orientation="right"
                                        domain={[
                                            "dataMin - 5",
                                            "dataMax + 5",
                                        ]}
                                        tickFormatter={(value) =>
                                            `${value}%`
                                        }
                                    />

                                    <Tooltip
                                        formatter={(value, name) => {
                                            if (
                                                name === "Temperature"
                                            ) {
                                                return [
                                                    `${value} °C`,
                                                    name,
                                                ];
                                            }

                                            return [
                                                `${value} %`,
                                                name,
                                            ];
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