import { PrismaClient, AircraftStatus, AlertSeverity, UserRole } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

const passwordHash = await bcrypt.hash('DemoPass123!', 12);

const demoUsers = [
  {
    email: 'manager@skyguard.demo',
    passwordHash,
    role: UserRole.FLEET_MANAGER
  },
  {
    email: 'tech@skyguard.demo',
    passwordHash,
    role: UserRole.MAINTENANCE_TECH
  }
];

const demoAircraft = [
  {
    tailNumber: 'N12345',
    model: 'Boeing 737-8',
    totalFlightHours: 4820.4,
    status: AircraftStatus.OPERATIONAL
  },
  {
    tailNumber: 'N67890',
    model: 'Airbus A320neo',
    totalFlightHours: 3912.7,
    status: AircraftStatus.MAINTENANCE_REQUIRED
  },
  {
    tailNumber: 'N24680',
    model: 'Boeing 787-9',
    totalFlightHours: 6141.2,
    status: AircraftStatus.OPERATIONAL
  },
  {
    tailNumber: 'N13579',
    model: 'Embraer E195-E2',
    totalFlightHours: 2276.9,
    status: AircraftStatus.GROUNDED
  }
];

const telemetryTemplates = {
  N12345: [
    { flightNumber: 'SG-210', engineTemperature: 812, oilPressure: 43.2, vibrationLevel: 2.4, altitude: 32000 },
    { flightNumber: 'SG-211', engineTemperature: 826, oilPressure: 42.8, vibrationLevel: 2.6, altitude: 34000 },
    { flightNumber: 'SG-212', engineTemperature: 841, oilPressure: 41.9, vibrationLevel: 2.7, altitude: 35500 },
    { flightNumber: 'SG-213', engineTemperature: 858, oilPressure: 41.5, vibrationLevel: 2.9, altitude: 36000 },
    { flightNumber: 'SG-214', engineTemperature: 869, oilPressure: 40.9, vibrationLevel: 3.1, altitude: 36500 }
  ],
  N67890: [
    { flightNumber: 'SG-330', engineTemperature: 901, oilPressure: 39.4, vibrationLevel: 5.2, altitude: 28000 },
    { flightNumber: 'SG-331', engineTemperature: 934, oilPressure: 38.6, vibrationLevel: 6.1, altitude: 29500 },
    { flightNumber: 'SG-332', engineTemperature: 957, oilPressure: 37.9, vibrationLevel: 7.4, altitude: 31000 },
    { flightNumber: 'SG-333', engineTemperature: 963, oilPressure: 37.2, vibrationLevel: 7.9, altitude: 31500 },
    { flightNumber: 'SG-334', engineTemperature: 948, oilPressure: 37.0, vibrationLevel: 7.2, altitude: 30800 }
  ],
  N24680: [
    { flightNumber: 'SG-440', engineTemperature: 788, oilPressure: 44.1, vibrationLevel: 2.2, altitude: 37000 },
    { flightNumber: 'SG-441', engineTemperature: 796, oilPressure: 43.8, vibrationLevel: 2.1, altitude: 37200 },
    { flightNumber: 'SG-442', engineTemperature: 805, oilPressure: 43.2, vibrationLevel: 2.3, altitude: 37400 },
    { flightNumber: 'SG-443', engineTemperature: 819, oilPressure: 42.9, vibrationLevel: 2.4, altitude: 37600 },
    { flightNumber: 'SG-444', engineTemperature: 827, oilPressure: 42.4, vibrationLevel: 2.6, altitude: 37800 }
  ],
  N13579: [
    { flightNumber: 'SG-550', engineTemperature: 960, oilPressure: 35.8, vibrationLevel: 7.6, altitude: 25000 },
    { flightNumber: 'SG-551', engineTemperature: 972, oilPressure: 35.2, vibrationLevel: 7.9, altitude: 25500 },
    { flightNumber: 'SG-552', engineTemperature: 981, oilPressure: 34.8, vibrationLevel: 8.2, altitude: 26000 },
    { flightNumber: 'SG-553', engineTemperature: 993, oilPressure: 34.1, vibrationLevel: 8.7, altitude: 26200 },
    { flightNumber: 'SG-554', engineTemperature: 1006, oilPressure: 33.7, vibrationLevel: 8.9, altitude: 25800 }
  ]
} as const;

const alertSeedData = [
  {
    tailNumber: 'N67890',
    component: 'Engine 1',
    severity: AlertSeverity.CRITICAL,
    description: 'Vibration and temperature thresholds exceeded during climb segment on SG-333.',
    isResolved: false
  },
  {
    tailNumber: 'N13579',
    component: 'Hydraulics',
    severity: AlertSeverity.CRITICAL,
    description: 'Aircraft grounded after repeated high-temperature telemetry and abnormal vibration values.',
    isResolved: false
  },
  {
    tailNumber: 'N24680',
    component: 'Oil Pressure',
    severity: AlertSeverity.MEDIUM,
    description: 'Oil pressure trended low on the previous sortie. Monitor next flight cycle.',
    isResolved: true
  }
];

async function main() {
  await prisma.maintenanceAlert.deleteMany();
  await prisma.telemetryLog.deleteMany();
  await prisma.aircraft.deleteMany();
  await prisma.user.deleteMany();

  for (const user of demoUsers) {
    await prisma.user.create({ data: user });
  }

  const aircraftRecords = [] as Awaited<ReturnType<typeof prisma.aircraft.create>>[];

  for (const aircraft of demoAircraft) {
    aircraftRecords.push(await prisma.aircraft.create({ data: aircraft }));
  }

  const aircraftByTailNumber = new Map(aircraftRecords.map((aircraft) => [aircraft.tailNumber, aircraft]));

  const now = new Date();
  const telemetryRows = Object.entries(telemetryTemplates).flatMap(([tailNumber, entries], aircraftIndex) => {
    const aircraft = aircraftByTailNumber.get(tailNumber);

    if (!aircraft) {
      return [];
    }

    return entries.map((entry, entryIndex) => ({
      aircraftId: aircraft.id,
      flightNumber: entry.flightNumber,
      engineTemperature: entry.engineTemperature,
      oilPressure: entry.oilPressure,
      vibrationLevel: entry.vibrationLevel,
      altitude: entry.altitude,
      timestamp: new Date(now.getTime() - (aircraftIndex * 5 + entryIndex) * 90 * 60 * 1000)
    }));
  });

  for (const row of telemetryRows) {
    await prisma.telemetryLog.create({ data: row });
  }

  const alerts = alertSeedData.flatMap((alert) => {
    const aircraft = aircraftByTailNumber.get(alert.tailNumber);

    if (!aircraft) {
      return [];
    }

    return [{
      aircraftId: aircraft.id,
      component: alert.component,
      severity: alert.severity,
      description: alert.description,
      isResolved: alert.isResolved
    }];
  });

  for (const alert of alerts) {
    await prisma.maintenanceAlert.create({ data: alert });
  }

  console.log('Demo seed completed:');
  console.log(`- Users: ${demoUsers.length}`);
  console.log(`- Aircraft: ${aircraftRecords.length}`);
  console.log(`- Telemetry logs: ${telemetryRows.length}`);
  console.log(`- Maintenance alerts: ${alerts.length}`);
}

main()
  .catch((error) => {
    console.error('Demo seed failed:', error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });