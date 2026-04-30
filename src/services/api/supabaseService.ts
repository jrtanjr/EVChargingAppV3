const SUPABASE_URL = 'https://alvdbsxfgkurozjyxqqy.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFsdmRic3hmZ2t1cm96anl4cXF5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc1MjM4NDEsImV4cCI6MjA5MzA5OTg0MX0.1oIAwQCmlZx68n75GOOgD4QKIPsOsF2H9H9vn5VPU1o';

// ================= SAVE CHARGING =================
export const saveChargingToCloud = async (data: any) => {
  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/charging_history`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        apikey: SUPABASE_KEY,
        Authorization: `Bearer ${SUPABASE_KEY}`,
      },
      body: JSON.stringify(data),
    });

    console.log('Cloud Save:', await res.text());
  } catch (err) {
    console.log('Cloud Error:', err);
  }
};

// ================= GET CHARGING =================
export const getChargingFromCloud = async () => {
  try {
    const res = await fetch(
      `${SUPABASE_URL}/rest/v1/charging_history?select=*`
    );

    const data = await res.json();
    return data;
  } catch (err) {
    console.log(err);
    return [];
  }
};