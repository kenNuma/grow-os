import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { createDevice } from "../device.api";

import "./DeviceRegister.css";

const DEVICE_NAME_MAX_LENGTH = 50;

export default function DeviceRegister() {
    const navigate = useNavigate();

    const [name, setName] = useState("");
    const [deviceKey, setDeviceKey] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const isFormValid =
        name.trim().length > 0 &&
        name.trim().length <= DEVICE_NAME_MAX_LENGTH &&
        deviceKey.length > 0;

    async function handleSubmit(
        event: React.FormEvent<HTMLFormElement>,
    ) {
        event.preventDefault();

        if (loading) {
            return;
        }

        const trimmedName = name.trim();
        const trimmedDeviceKey = deviceKey.trim();



        setError("");

        if (!trimmedName) {
            setError("デバイス名を入力してください。");
            return;
        }

        if (trimmedName.length > DEVICE_NAME_MAX_LENGTH) {
            setError(
                `デバイス名は${DEVICE_NAME_MAX_LENGTH}文字以内で入力してください。`,
            );
            return;
        }

        if (!trimmedDeviceKey) {
            setError("Device Keyを入力してください。");
            return;
        }

        try {
            setLoading(true);

            await createDevice({
                name: trimmedName,
                deviceKey: trimmedDeviceKey,
            });

            navigate("/");
        } catch (err) {
            console.error(err);

            if (err instanceof Error) {
                setError(err.message);
            } else {
                setError("登録に失敗しました。");
            }
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="device-register">
            <h1>デバイス登録</h1>

            <form onSubmit={handleSubmit}>
                <label>
                    デバイス名
                    <input
                        type="text"
                        value={name}
                        maxLength={DEVICE_NAME_MAX_LENGTH}
                        onChange={(event) => {
                            setName(event.target.value);

                            if (error) {
                                setError("");
                            }
                        }}
                        disabled={loading}
                        required
                    />
                </label>

                <p className="device-register__counter">
                    {name.length} / {DEVICE_NAME_MAX_LENGTH}
                </p>

                <label>
                    Device Key
                    <input
                        type="text"
                        value={deviceKey}
                        onChange={(event) => {
                            setDeviceKey(event.target.value);

                            if (error) {
                                setError("");
                            }
                        }}
                        disabled={loading}
                        required
                    />
                </label>

                {error && (
                    <p className="device-register__error">
                        {error}
                    </p>
                )}

                <button
                    type="submit"
                    disabled={loading || !isFormValid}
                >
                    {loading ? "登録中..." : "登録"}
                </button>
            </form>
        </div>
    );
}