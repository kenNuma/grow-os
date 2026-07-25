import { useEffect, useState } from "react";
import { getDevices } from "../device/device.api";
import type { Device } from "../device/device.types";

function Dashboard() {
    const [devices, setDevices] = useState<Device[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    useEffect(() => {
        async function fetchDevices() {
            try {
                const data = await getDevices();
                setDevices(data);
            } catch (error) {
                console.error(error);
                setErrorMessage("デバイス情報の取得に失敗しました。");
            } finally {
                setIsLoading(false);
            }
        }

        fetchDevices();
    }, []);

    if (isLoading) {
        return <p>読み込み中...</p>;
    }

    if (errorMessage) {
        return <p>{errorMessage}</p>;
    }

    return (
        <main>
            <h1>GrowOS Dashboard</h1>

            {devices.length === 0 ? (
                <p>登録されているデバイスはありません。</p>
            ) : (
                <ul>
                    {devices.map((device) => (
                        <li key={device.id}>
                            <strong>{device.name}</strong>
                            <div>deviceKey: {device.deviceKey}</div>
                            <div>status: {device.status}</div>
                        </li>
                    ))}
                </ul>
            )}
        </main>
    );
}

export default Dashboard;