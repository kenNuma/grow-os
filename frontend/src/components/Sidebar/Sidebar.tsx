import { NavLink } from "react-router-dom";

import "./Sidebar.css";

function Sidebar() {
    return (
        <aside className="sidebar">
            <h2 className="sidebar__logo">
                🌱 GrowOS
            </h2>

            <nav>
                <ul className="sidebar__menu">
                    <li>
                        <NavLink
                            to="/"
                            end
                            className={({ isActive }) =>
                                [
                                    "sidebar__item",
                                    isActive
                                        ? "sidebar__item--active"
                                        : "",
                                ]
                                    .filter(Boolean)
                                    .join(" ")
                            }
                        >
                            Dashboard
                        </NavLink>
                    </li>

                    <li>
                        <NavLink
                            to="/devices/new"
                            className={({ isActive }) =>
                                [
                                    "sidebar__item",
                                    isActive
                                        ? "sidebar__item--active"
                                        : "",
                                ]
                                    .filter(Boolean)
                                    .join(" ")
                            }
                        >
                            Devices
                        </NavLink>
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