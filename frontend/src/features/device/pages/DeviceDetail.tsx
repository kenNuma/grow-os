import "./DeviceDetail.css";

function DeviceDetail() {
    return (
        <section className="device-detail">
            <div className="device-detail__header">
                <div>
                    <p className="device-detail__eyebrow">Device Management</p>
                    <h1 className="device-detail__title">Device Detail</h1>
                </div>
            </div>

            <div className="device-detail__content">
                <p>ここにデバイス情報を表示します。</p>
            </div>
        </section>
    );
}

export default DeviceDetail;