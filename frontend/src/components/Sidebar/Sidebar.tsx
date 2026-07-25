import "./Sidebar.css";

function Sidebar() {
    return (
        <aside className="sidebar">
            <h2 className="sidebar__logo">
                🌱 GrowOS
            </h2>

            <nav>
                <ul className="sidebar__menu">
                    <li className="sidebar__item sidebar__item--active">
                        Dashboard
                    </li>

                    <li className="sidebar__item">
                        Devices
                    </li>

                    <li className="sidebar__item">
                        Logs
                    </li>

                    <li className="sidebar__item">
                        Settings
                    </li>
                </ul>
            </nav>
        </aside>
    );
}

export default Sidebar;