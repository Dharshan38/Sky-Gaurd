import axios from 'axios';

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:4000/api/v1',
  timeout: 10000
});

export interface DashboardSummaryResponse {
  totalPlanes: number;
  operationalCount: number;
  activeCriticalAlerts: number;
}

export interface AircraftAnalyticsPoint {
  timestamp: string;
  flightNumber: string;
  engineTemperature: number;
  oilPressure: number;
  vibrationLevel: number;
  altitude: number;
}

export interface AircraftAnalyticsResponse {
  aircraft: {
    id: string;
    tailNumber: string;
    model: string;
    status: string;
    totalFlightHours: number;
  };
  series: AircraftAnalyticsPoint[];
}