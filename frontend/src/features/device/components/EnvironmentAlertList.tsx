import type { Telemetry } from "../../telemetry/telemetry.types";

import { calculateVPD } from "../../../shared/calculations/calculateVPD";
import { getHumidityStatus } from "../../../shared/calculations/getHumidityStatus";
import { getTemperatureStatus } from "../../../shared/calculations/getTemperatureStatus";
import { getVPDStatus } from "../../../shared/calculations/getVPDStatus";

import type { EnvironmentStatus } from "../../../shared/calculations/status_type";

type EnvironmentAlertListProps = {
    telemetry: Telemetry | null;
};

type EnvironmentAlert = EnvironmentStatus & {
    title: string;
    description: string;
};

function EnvironmentAlertList({
    telemetry,
}: EnvironmentAlertListProps) {
    if (!telemetry) {
        return null;
    }

    const vpd = calculateVPD(
        telemetry.temperature,
        telemetry.humidity,
    );

    const statuses: EnvironmentStatus[] = [
        getTemperatureStatus(telemetry.temperature),
        getHumidityStatus(telemetry.humidity),
        getVPDStatus(vpd),
    ];

    const alerts = statuses.filter(
        (status): status is EnvironmentAlert =>
            status.title !== undefined &&
            status.description !== undefined,
    );

    if (alerts.length === 0) {
        return null;
    }

    return (
        <article className="device-detail__panel device-detail__alert-panel">
            <div className="device-detail__panel-header">
                <div>
                    <p className="device-detail__panel-eyebrow">
                        Environment Analysis
                    </p>

                    <h2 className="device-detail__panel-title">
                        Environment Alerts
                    </h2>
                </div>
            </div>

            <div className="device-detail__alert-list">
                {alerts.map((alert) => (
                    <div
                        key={alert.title}
                        className={`device-detail__alert device-detail__alert--${alert.variant}`}
                    >
                        <div className="device-detail__alert-header">
                            <span
                                className={`device-detail__vpd-status device-detail__vpd-status--${alert.variant}`}
                            >
                                {alert.label}
                            </span>

                            <h3 className="device-detail__alert-title">
                                {alert.title}
                            </h3>
                        </div>

                        <p className="device-detail__alert-description">
                            {alert.description}
                        </p>
                    </div>
                ))}
            </div>
        </article>
    );
}

export default EnvironmentAlertList;