import { getDBConnection } from '../../database/sqlite';

export const insertPayment = async ({
  charging_id,
  amount,
  method,
  status,
}: any) => {
  const db = await getDBConnection();

  await db.executeSql(
    `INSERT INTO payments (charging_id, amount, method, status, timestamp)
     VALUES (?, ?, ?, ?, ?)`,
    [
      charging_id,
      amount,
      method,
      status,
      new Date().toISOString(),
    ]
  );
};

export const getPayments = async () => {
  const db = await getDBConnection();

  const results = await db.executeSql(
    `SELECT * FROM payments ORDER BY timestamp DESC`
  );

  return results[0].rows.raw();
};