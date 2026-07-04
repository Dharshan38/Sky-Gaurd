import type { RequestHandler } from 'express';
import { prisma } from '../config/prisma.js';
import { HttpError } from '../utils/httpError.js';

export const getDashboardSummary: RequestHandler = async (_req, res, next) => {
  try {
    const [totalPlanes, operationalCount, activeCriticalAlerts] = await Promise.all([
      prisma.aircraft.count(),
      prisma.aircraft.count({
        where: { status: 'OPERATIONAL' }
      }),
      prisma.maintenanceAlert.count({
        where: {
          severity: 'CRITICAL',
          isResolved: false
        }
      })
    ]);

    res.status(200).json({
      success: true,
      data: {
        totalPlanes,
        operationalCount,
        activeCriticalAlerts
      }
    });
  } catch (error) {
    next(error);
  }
};

export const getAircraftAnalytics: RequestHandler = async (req, res, next) => {
  try {
    const { tailNumber } = req.params as {
      tailNumber: string;
    };

    const queryLimit = typeof req.query.limit === 'string' ? Number(req.query.limit) : 100;
    const limit = Number.isFinite(queryLimit) ? queryLimit : 100;

    const aircraft = await prisma.aircraft.findUnique({
      where: {
        tailNumber
      },
      select: {
        id: true,
        tailNumber: true,
        model: true,
        status: true,
        totalFlightHours: true
      }
    });

    if (!aircraft) {
      throw new HttpError(404, 'Aircraft not found');
    }

    const telemetryLogs = await prisma.telemetryLog.findMany({
      where: {
        aircraftId: aircraft.id
      },
      orderBy: {
        timestamp: 'desc'
      },
      take: limit,
      select: {
        flightNumber: true,
        engineTemperature: true,
        oilPressure: true,
        vibrationLevel: true,
        altitude: true,
        timestamp: true
      }
    });

    const timeSeries = telemetryLogs
      .reverse()
      .map((entry: {
        flightNumber: string;
        engineTemperature: number;
        oilPressure: number;
        vibrationLevel: number;
        altitude: number;
        timestamp: Date;
      }) => ({
        timestamp: entry.timestamp,
        flightNumber: entry.flightNumber,
        engineTemperature: entry.engineTemperature,
        oilPressure: entry.oilPressure,
        vibrationLevel: entry.vibrationLevel,
        altitude: entry.altitude
      }));

    res.status(200).json({
      success: true,
      data: {
        aircraft: {
          id: aircraft.id,
          tailNumber: aircraft.tailNumber,
          model: aircraft.model,
          status: aircraft.status,
          totalFlightHours: aircraft.totalFlightHours
        },
        series: timeSeries
      }
    });
  } catch (error) {
    next(error);
  }
};