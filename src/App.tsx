import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { SimulationProvider } from './store/SimulationContext';
import Layout from './components/Layout/Layout';
import Dashboard from './pages/Dashboard';
import FleetMonitoring from './pages/FleetMonitoring';
import AircraftDetails from './pages/AircraftDetails';
import LiveMonitoring from './pages/LiveMonitoring';
import EdgeAIDevice from './pages/EdgeAIDevice';
import AIPrediction from './pages/AIPrediction';
import Alerts from './pages/Alerts';
import Maintenance from './pages/Maintenance';
import SimulationLab from './pages/SimulationLab';
import DigitalTwin from './pages/DigitalTwin';
import AIExplainability from './pages/AIExplainability';
import MaintenanceScheduler from './pages/MaintenanceScheduler';

export default function App() {
  return (
    <SimulationProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Dashboard />} />
            <Route path="fleet" element={<FleetMonitoring />} />
            <Route path="aircraft" element={<AircraftDetails />} />
            <Route path="live" element={<LiveMonitoring />} />
            <Route path="edge" element={<EdgeAIDevice />} />
            <Route path="prediction" element={<AIPrediction />} />
            <Route path="alerts" element={<Alerts />} />
            <Route path="maintenance" element={<Maintenance />} />
            <Route path="scheduler" element={<MaintenanceScheduler />} />
            <Route path="simulation" element={<SimulationLab />} />
            <Route path="twin" element={<DigitalTwin />} />
            <Route path="explain" element={<AIExplainability />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </SimulationProvider>
  );
}
