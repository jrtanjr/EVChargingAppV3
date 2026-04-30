import { supabase } from '../api/supabaseClient';
import { getCurrentUser } from '../api/authService';

// ==============================
// GET FAVOURITES
// ==============================
export const getFavourites = async () => {
  const user = await getCurrentUser();

  const { data, error } = await supabase
    .from('favourites')
    .select('station_id')
    .eq('user_id', user?.id);

  if (error) {
    console.log('Get Favourites Error:', error);
    return [];
  }

  return data ? data.map((f) => f.station_id) : [];
};

// ==============================
// TOGGLE FAVOURITE
// ==============================
export const toggleFavourite = async (stationId: number) => {
  const user = await getCurrentUser();

  const { data, error } = await supabase
    .from('favourites')
    .select('*')
    .eq('user_id', user?.id)
    .eq('station_id', stationId);

  if (error) {
    console.log('Toggle Check Error:', error);
    return;
  }

  if (data && data.length > 0) {
    // REMOVE
    const { error: deleteError } = await supabase
      .from('favourites')
      .delete()
      .eq('user_id', user?.id)
      .eq('station_id', stationId);

    if (deleteError) console.log('Delete Favourite Error:', deleteError);
  } else {
    // ADD
    const { error: insertError } = await supabase
      .from('favourites')
      .insert({
        user_id: user?.id,
        station_id: stationId,
      });

    if (insertError) console.log('Insert Favourite Error:', insertError);
  }
};

// ==============================
// CHECK FAVOURITE
// ==============================
export const isFavouriteStation = async (stationId: number) => {
  const user = await getCurrentUser();

  const { data, error } = await supabase
    .from('favourites')
    .select('*')
    .eq('user_id', user?.id)
    .eq('station_id', stationId);

  if (error) {
    console.log('Check Favourite Error:', error);
    return false;
  }

  return data && data.length > 0;
};