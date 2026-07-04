import type { RequestHandler } from 'express';
import { prisma } from '../config/prisma.js';
import { HttpError } from '../utils/httpError.js';
import type { AircraftStatus, AlertSeverity } from '../types/domain.js';

export const ingestTelemetry: RequestHandler = async (req, res, next) => {
  try {
    const payload = req.body as {
      aircraftId?: string;
      tailNumber?: string;
      flightNumber: string;
      engineTemperature: number;
      oilPressure: number;
      vibrationLevel: number;
      altitude: number;
      timestamp?: Date;
    };

    const aircraft = payload.aircraftId
      ? await prisma.aircraft.findUnique({
          where: { id: payload.aircraftId }
        })
      : await prisma.aircraft.findUnique({
          where: { tailNumber: payload.tailNumber as string }
        });

    if (!aircraft) {
      throw new HttpError(404, 'Aircraft not found');
    }

    const shouldCreateCriticalAlert =
      payload.engineTemperature > 950 || payload.vibrationLevel > 7.08;

    const result = await prisma.$transaction(async (transaction) => {
      const telemetryLog = await transaction.telemetryLog.create({
        data: {
          aircraftId: aircraft.id,
          flightNumber: payload.flightNumber,
          engineTemperature: payload.engineTemperature,
          oilPressure: payload.oilPressure,
          vibrationLevel: payload.vibrationLevel,
          altitude: payload.altitude,
          timestamp: payload.timestamp ?? new Date()
        }
      });

      let maintenanceAlert: Awaited<ReturnType<typeof transaction.maintenanceAlert.create>> | null = null;

      if (shouldCreateCriticalAlert) {
        maintenanceAlert = await transaction.maintenanceAlert.create({
          data: {
            aircraftId: aircraft.id,
            component: 'Engine 1',
            severity: 'CRITICAL' satisfies AlertSeverity,
            description: `Critical threshold breached for ${aircraft.tailNumber}: engine temperature ${payload.engineTemperature.toFixed(2)} and vibration ${payload.vibrationLevel.toFixed(2)} exceeded safe limits.`,
            isResolved: false
          }
        });

        await transaction.aircraft.update({
          where: { id: aircraft.id },
          data: {
            status: 'MAINTENANCE_REQUIRED' satisfies AircraftStatus
          }
        });
      }

      return {
        telemetryLog,
        maintenanceAlert
      };
    });

    res.status(201).json({
      success: true,
      message: shouldCreateCriticalAlert
        ? 'Telemetry ingested and critical maintenance alert generated.'
        : 'Telemetry ingested successfully.',
      data: {
        telemetryLog: result.telemetryLog,
        maintenanceAlert: result.maintenanceAlert,
        aircraftStatus: shouldCreateCriticalAlert
          ? 'MAINTENANCE_REQUIRED'
          : aircraft.status
      }
    });
  } catch (error) {
    next(error);
  }
};