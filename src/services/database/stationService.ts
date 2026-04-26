import { getDBConnection } from '../../database/sqlite';

export const getStations = async () => {
  const db = await getDBConnection();

  const results = await db.executeSql(`SELECT * FROM stations`);

  const stations: any[] = [];

  results.forEach((result:any) => {
    for (let i = 0; i < result.rows.length; i++) {
      stations.push(result.rows.item(i));
    }
  });

  return stations;
};


export const insertStationsWithConnectors = async (stations: any[]) => {
  const db = await getDBConnection();

  for (const station of stations) {
    const result = await db.executeSql(
      `INSERT INTO stations (id, name, provider, address, latitude, longitude, total_ports, available_ports)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        station.id,
        station.name,
        station.provider,
        station.address,
        station.latitude,
        station.longitude,
        station.total_ports,
        station.available_ports
      ]
    );

    const stationId = station.id; // Use the provided station ID

    // Insert connectors
  for (const conn of station.connectors || []) {
      await db.executeSql(
        `INSERT INTO connectors (station_id, type, current_type, power_kw, quantity, available)
        VALUES (?, ?, ?, ?, ?, ?)`,
        [
          stationId,
          conn.type,
          conn.current_type,
          conn.power_kw,
          conn.quantity,
          conn.available, // store simulated availability
        ]
      );
    }
  };
};

export const clearStations = async () => {
  const db = await getDBConnection();
  await db.executeSql(`DELETE FROM connectors`); // Clear connectors first due to foreign key constraint
  await db.executeSql(`DELETE FROM stations`);
};

export const getConnectorsByStation = async (stationId: number) => {
  const db = await getDBConnection();

  const results = await db.executeSql(
    `SELECT * FROM connectors WHERE station_id = ?`,
    [stationId]
  );

  const data: any[] = [];

  results.forEach((result: any) => {
    for (let i = 0; i < result.rows.length; i++) {
      data.push(result.rows.item(i));
    }
  });

  return data;
};
