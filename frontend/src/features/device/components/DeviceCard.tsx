import { useEffect, useState } from "react";
import { ApiError } from "../../../shared/api/client";
import { getLatestTelemetry } from "../../telemetry/telemetry.api";
import type { Telemetry } from "../../telemetry/telemetry.types";
import type { Device } from "../device.types";
import "./DeviceCard.css";

type DeviceCardProps = {
    device: Device;
};

function DeviceCard({ device }: DeviceCardProps) {
    const [telemetry, setTelemetry] = useState<Telemetry | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    const isOnline = device.status.toLowerCase() === "online";

    useEffect(() => {
        async function fetchLatestTelemetry() {
            try {
                const data = await getLatestTelemetry(device.deviceKey);
                setTelemetry(data);
            } catch (error) {
                if (error instanceof ApiError && error.status === 404) {
                    setErrorMessage("Telemetryデータがありません。");
                    return;
                }

                console.error(error);
                setErrorMessage("Telemetryの取得に失敗しました。");
            } finally {
                setIsLoading(false);
            }
        }

        fetchLatestTelemetry();
    }, [device.deviceKey]);

    return (
        <article className="device-card">
            <header className="device-card__header">
                <div>
                    <h2 className="device-card__name">{device.name}</h2>
                    <p className="device-card__key">{device.deviceKey}</p>
                </div>

                <span
                    className={`device-card__status ${isOnline
                            ? "device-card__status--online"
                            : "device-card__status--offline"
                        }`}
                >
                    {device.status}
                </span>
            </header>

            <dl className="device-card__metrics">
                <div className="device-card__metric">
                    <dt className="device-card__label">温度</dt>
                    <dd className="device-card__value">
                        {isLoading
                            ? "..."
                            : telemetry
                                ? `${telemetry.temperature}℃`
                                : "-"}
                    </dd>
                </div>

                <div className="device-card__metric">
                    <dt className="device-card__label">湿度</dt>
                    <dd className="device-card__value">
                        {isLoading
                            ? "..."
                            : telemetry
                                ? `${telemetry.humidity}%`
                                : "-"}
                    </dd>
                </div>
            </dl>

            <footer className="device-card__footer">
                <p className="device-card__time">
                    最終計測：
                    {isLoading
                        ? "読み込み中..."
                        : telemetry
                            ? new Date(telemetry.recordedAt).toLocaleString("ja-JP")
                            : "データなし"}
                </p>

                {errorMessage && (
                    <p className="device-card__error">{errorMessage}</p>
                )}
            </footer>
        </article>
    );
}

export default DeviceCard;