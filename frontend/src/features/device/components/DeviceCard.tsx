import { useEffect, useState } from "react";
import { ApiError } from "../../../shared/api/client";
import { getLatestTelemetry } from "../../telemetry/telemetry.api";
import type { Telemetry } from "../../telemetry/telemetry.types";
import type { Device } from "../device.types";

type DeviceCardProps = {
    device: Device;
};

function DeviceCard({ device }: DeviceCardProps) {
    const [telemetry, setTelemetry] = useState<Telemetry | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

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
        <article>
            <h2>{device.name}</h2>

            <dl>
                <div>
                    <dt>Device Key</dt>
                    <dd>{device.deviceKey}</dd>
                </div>

                <div>
                    <dt>Status</dt>
                    <dd>{device.status}</dd>
                </div>

                <div>
                    <dt>Last Seen</dt>
                    <dd>
                        {device.lastSeenAt
                            ? new Date(device.lastSeenAt).toLocaleString("ja-JP")
                            : "未接続"}
                    </dd>
                </div>

                <div>
                    <dt>Temperature</dt>
                    <dd>
                        {isLoading
                            ? "読み込み中..."
                            : telemetry
                                ? `${telemetry.temperature} ℃`
                                : "-"}
                    </dd>
                </div>

                <div>
                    <dt>Humidity</dt>
                    <dd>
                        {isLoading
                            ? "読み込み中..."
                            : telemetry
                                ? `${telemetry.humidity} %`
                                : "-"}
                    </dd>
                </div>

                <div>
                    <dt>Recorded At</dt>
                    <dd>
                        {isLoading
                            ? "読み込み中..."
                            : telemetry
                                ? new Date(telemetry.recordedAt).toLocaleString("ja-JP")
                                : "-"}
                    </dd>
                </div>
            </dl>

            {errorMessage && <p>{errorMessage}</p>}
        </article>
    );
}

export default DeviceCard;