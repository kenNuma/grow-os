import { useState, useEffect } from "react";

import "./DeviceControlPanel.css";
import { controlDevice, getControlState } from "../device.api";

type Props = {
    deviceKey: string;
};

function DeviceControlPanel({
    deviceKey,
}: Props) {
    const [isLedOn, setIsLedOn] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function loadControlState() {
            try {
                const controlState = await getControlState(deviceKey);
                setIsLedOn(controlState.led);
            } catch (error) {
                console.error(error);
            }
        }

        loadControlState();
    }, [deviceKey]);

    async function toggleLed() {
        const nextAction = isLedOn ? "off" : "on";

        try {
            setIsLoading(true);
            setError(null);

            await controlDevice(deviceKey, {
                target: "led",
                action: nextAction,
            });

            setIsLedOn(nextAction === "on");
        } catch (error) {
            console.error(error);
            setError("Failed to control LED.");
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <article className="device-detail__panel device-detail__panel--wide">
            <div className="device-detail__panel-header">
                <div>
                    <p className="device-detail__panel-eyebrow">
                        Device Control
                    </p>

                    <h2 className="device-detail__panel-title">
                        Manual Controls
                    </h2>
                </div>
            </div>

            <div className="device-control">
                <div className="device-control__row">
                    <div className="device-control__information">
                        <h3 className="device-control__name">
                            LED
                        </h3>

                        <p className="device-control__description">
                            Control the onboard LED connected to this device.
                        </p>
                    </div>

                    <div className="device-control__operation">
                        <div className="device-control__status-row">
                            <span className="device-control__status-label">
                                Status
                            </span>

                            <span
                                className={`device-control__status ${isLedOn
                                    ? "device-control__status--on"
                                    : "device-control__status--off"
                                    }`}
                            >
                                <span className="device-control__status-dot" />
                                {isLedOn ? "ON" : "OFF"}
                            </span>
                        </div>

                        <button
                            className={`device-detail__button ${isLedOn
                                ? "device-detail__button--secondary"
                                : "device-detail__button--primary"
                                }`}
                            type="button"
                            onClick={toggleLed}
                            disabled={isLoading}
                        >
                            {isLoading
                                ? "Sending..."
                                : isLedOn
                                    ? "Turn OFF"
                                    : "Turn ON"}
                        </button>
                    </div>
                </div>

                {error && (
                    <p className="device-control__error">
                        {error}
                    </p>
                )}
            </div>
        </article>
    );
}

export default DeviceControlPanel;