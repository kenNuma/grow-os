import { Outlet } from "react-router-dom";

import Header from "../components/Header/Header";
import Sidebar from "../components/Sidebar/Sidebar";

import "./DashboardLayout.css";

function DashboardLayout() {
    return (
        <div className="layout">
            <Sidebar />

            <div className="layout__content">
                <Header />

                <main className="layout__main">
                    <Outlet />
                </main>
            </div>
        </div>
    );
}

export default DashboardLayout;