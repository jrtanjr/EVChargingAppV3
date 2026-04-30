import { supabase } from '../api/supabaseClient';


// ==============================
// GET PROFILE
// ==============================
export const getProfile = async (userId: string) => {
  const { data } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();

  return data;
};

// ==============================
// SAVE PROFILE
// ==============================
export const saveProfile = async (profile: any) => {
  const { error } = await supabase
    .from('profiles')
    .upsert(profile);

  if (error) console.log('Save Profile Error:', error);
};
