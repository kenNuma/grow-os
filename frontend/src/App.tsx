import { BrowserRouter, Route, Routes } from "react-router-dom";

import Dashboard from "./features/dashboard/pages/Dashboard";
import DeviceDetail from "./features/device/pages/DeviceDetail";
import DashboardLayout from "./layouts/DashboardLayout";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<DashboardLayout />}>
          <Route path="/" element={<Dashboard />} />
          <Route
            path="/devices/:deviceKey"
            element={<DeviceDetail />}
          />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;