import { Routes, Route } from 'react-router-dom';
import { HouseSelectPage } from './pages/HouseSelectPage';
import { SimulatorDashboardPage } from './pages/SimulatorDashboardPage';
import { DeviceInspectorPage } from './pages/DeviceInspectorPage';
import { ErrorBoundary } from './components/ErrorBoundary';

export default function App() {
  return (
    <ErrorBoundary>
      <Routes>
        <Route path="/" element={<HouseSelectPage />} />
        <Route path="/simulator/:houseId" element={<SimulatorDashboardPage />} />
        <Route path="/simulator/:houseId/:floorId/:deviceId" element={<DeviceInspectorPage />} />
        <Route path="*" element={<HouseSelectPage />} />
      </Routes>
    </ErrorBoundary>
  );
}
