import "./DashboardLayout.css";

import type { ReactNode } from "react";

import Header from "../components/Header/Header";
import Sidebar from "../components/Sidebar/Sidebar";

type DashboardLayoutProps = {
    children: ReactNode;
};

function DashboardLayout({
    children,
}: DashboardLayoutProps) {
    return (
        <div className="layout">
            <Sidebar />

            <div className="layout__content">
                <Header />

                <main className="layout__main">
                    {children}
                </main>
            </div>
        </div>
    );
}

export default DashboardLayout;