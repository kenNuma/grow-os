import { useEffect, useState } from "react";
import DashboardSummary from "../components/DashboardSummary";
import DeviceList from "../../device/components/DeviceList";
import { getDevices } from "../../device/device.api";
import type { Device } from "../../device/device.types";
import "./Dashboard.css";

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

    return (
        <main className="dashboard">
            <div className="dashboard__container">
                <header className="dashboard__header">
                    <h1 className="dashboard__title">GrowOS Dashboard</h1>
                    <p className="dashboard__description">
                        植物の状態をリアルタイムで監視します
                    </p>
                </header>

                {isLoading && (
                    <p className="dashboard__message">デバイス情報を読み込んでいます...</p>
                )}

                {errorMessage && (
                    <p className="dashboard__message dashboard__message--error">
                        {errorMessage}
                    </p>
                )}

                <DashboardSummary
                    totalDevices={devices.length}
                    onlineDevices={
                        devices.filter(
                            (device) => device.status.toLowerCase() === "online"
                        ).length
                    }
                />

                <section className="dashboard__devices">
                    <div className="dashboard__section-header">
                        <div>
                            <h2 className="dashboard__section-title">Devices</h2>
                            <p className="dashboard__section-description">
                                登録されているデバイスの現在状態
                            </p>
                        </div>
                    </div>


                    {!isLoading && !errorMessage && <DeviceList devices={devices} />}
                </section>
            </div>
        </main>
    );
}

export default Dashboard;