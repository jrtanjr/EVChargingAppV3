import { getDBConnection } from '../../database/sqlite';
import { getCurrentUser } from '../api/authService';

// ==============================
// INSERT PAYMENT
// ==============================
export const insertPayment = async ({
  user_id,
  charging_id,
  amount,
  method,
  status,
  card_last4,
}: any) => {
  const db = await getDBConnection();

  let userId = user_id;
  if (!userId) {
    const user = await getCurrentUser();
    userId = user?.id;
  }

  await db.executeSql(
    `INSERT INTO payments 
     (user_id, charging_id, amount, method, status, card_last4, timestamp)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [
      userId,                
      charging_id || null,
      amount,
      method,
      status,
      card_last4 || null,
      new Date().toISOString(),
    ]
  );
};

// ==============================
// GET PAYMENTS (USER FILTERED)
// ==============================
export const getPayments = async () => {
  const db = await getDBConnection(); 

  const user = await getCurrentUser();

  if (!user?.id) return [];

  const result = await db.executeSql(
    `SELECT * FROM payments 
     WHERE user_id = ? 
     ORDER BY timestamp DESC`,
    [user.id]
  );

  return result[0].rows.raw();
};

