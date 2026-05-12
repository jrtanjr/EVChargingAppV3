import Config from 'react-native-config';

const SUPABASE_URL = Config.SUPABASE_URL!;
const SUPABASE_KEY = Config.SUPABASE_KEY!;

// ================= SAVE CHARGING =================
export const saveChargingToCloud = async (data: any) => {
  try {
    const res = await fetch(
      `${SUPABASE_URL}/rest/v1/charging_history`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          apikey: SUPABASE_KEY,
          Authorization: `Bearer ${SUPABASE_KEY}`,
        },
        body: JSON.stringify(data),
      }
    );

    console.log('Cloud Save:', await res.text());
  } catch (err) {
    console.log('Cloud Error:', err);
  }
};

// ================= GET CHARGING =================
export const getChargingFromCloud = async () => {
  const res = await fetch(
    `${SUPABASE_URL}/rest/v1/charging_history?select=*`,
    {
      headers: {
        apikey: SUPABASE_KEY,
        Authorization: `Bearer ${SUPABASE_KEY}`,
      },
    }
  );

  return await res.json();
};