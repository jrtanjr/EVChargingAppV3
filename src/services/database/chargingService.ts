import { getDBConnection } from '../../database/sqlite';

export const insertChargingHistory = async ({
  station_id,
  energy,
  duration,
  cost,
  status,
}: any) => {
  const db = await getDBConnection();

  await db.executeSql(
    `INSERT INTO charging_history 
    (station_id, energy, duration, cost, status, timestamp)
    VALUES (?, ?, ?, ?, ?, ?)`,
    [
      station_id,
      energy,
      duration,
      cost,
      status,
      new Date().toISOString(),
    ]
  );
};

export const getChargingHistory = async () => {
  const db = await getDBConnection();

  const results = await db.executeSql(`
    SELECT 
      h.*,
      s.name as station_name,
      s.address as address
    FROM charging_history h
    LEFT JOIN stations s ON h.station_id = s.id
    ORDER BY h.timestamp DESC
  `);

  return results[0].rows.raw();
};