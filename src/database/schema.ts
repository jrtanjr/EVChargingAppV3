import { getDBConnection } from './sqlite';

export const initDatabase = async () => {
  try {
    await createTables();
    console.log("DB READY");
  } catch (error) {
    console.log("DB INIT ERROR:", error);
  }
};

export const createTables = async () => {
  const db = await getDBConnection();

  // Stations Table
  await db.executeSql(`
    CREATE TABLE IF NOT EXISTS stations (
      id INTEGER PRIMARY KEY,
      name TEXT,
      provider TEXT,
      address TEXT,
      latitude REAL,
      longitude REAL,
      total_ports INTEGER,
      available_ports INTEGER
    );
  `);

  // Connectors Table
  await db.executeSql(`
    CREATE TABLE IF NOT EXISTS connectors (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    station_id INTEGER,
    type TEXT,          -- Type 2, CCS, CHAdeMO
    current_type TEXT,  -- AC / DC
    power_kw REAL,
    quantity INTEGER,
    available INTEGER, -- simulate availability per connector
    FOREIGN KEY (station_id) REFERENCES stations(id)
  );
  `);

  // Charging History
  await db.executeSql(`
    CREATE TABLE IF NOT EXISTS charging_history (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id TEXT,
      station_id INTEGER,
      energy REAL,
      duration INTEGER,
      cost REAL,
      status TEXT,
      timestamp TEXT,
      is_synced INTEGER DEFAULT 0
    );
  `);

  // Payment Table
  await db.executeSql(`
    CREATE TABLE IF NOT EXISTS payments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id TEXT,
      charging_id INTEGER,
      amount REAL,
      method TEXT,
      status TEXT,
      card_last4 TEXT,
      timestamp TEXT,
      is_synced INTEGER DEFAULT 0
    );
  `);
};