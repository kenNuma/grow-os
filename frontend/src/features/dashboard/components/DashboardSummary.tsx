import "./DashboardSummary.css";

type DashboardSummaryProps = {
    totalDevices: number;
    onlineDevices: number;
};

function DashboardSummary({
    totalDevices,
    onlineDevices,
}: DashboardSummaryProps) {
    const offlineDevices = totalDevices - onlineDevices;

    return (
        <section className="dashboard-summary" aria-label="デバイス稼働状況">
            <article className="summary-card summary-card--devices">
                <div className="summary-card__header">
                    <span className="summary-card__icon" aria-hidden="true">
                        🌱
                    </span>
                    <span className="summary-card__label">Devices</span>
                </div>

                <strong className="summary-card__value">{totalDevices}</strong>
                <span className="summary-card__description">登録デバイス</span>
            </article>

            <article className="summary-card summary-card--online">
                <div className="summary-card__header">
                    <span className="summary-card__icon" aria-hidden="true">
                        ●
                    </span>
                    <span className="summary-card__label">Online</span>
                </div>

                <strong className="summary-card__value">{onlineDevices}</strong>
                <span className="summary-card__description">正常に稼働中</span>
            </article>

            <article className="summary-card summary-card--offline">
                <div className="summary-card__header">
                    <span className="summary-card__icon" aria-hidden="true">
                        ●
                    </span>
                    <span className="summary-card__label">Offline</span>
                </div>

                <strong className="summary-card__value">{offlineDevices}</strong>
                <span className="summary-card__description">接続を確認できません</span>
            </article>

            <article className="summary-card summary-card--alerts">
                <div className="summary-card__header">
                    <span className="summary-card__icon" aria-hidden="true">
                        !
                    </span>
                    <span className="summary-card__label">Alerts</span>
                </div>

                <strong className="summary-card__value">0</strong>
                <span className="summary-card__description">現在の警告</span>
            </article>
        </section>
    );
}

export default DashboardSummary;