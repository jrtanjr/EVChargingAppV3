import AsyncStorage from '@react-native-async-storage/async-storage';
import { getCurrentUser } from '../api/authService';

const getKey = async () => {
  const user = await getCurrentUser();
  return `favourites_${user?.id}`;
};

// ==============================
// GET FAVOURITES
// ==============================
export const getFavourites = async () => {
  const key = await getKey();
  const data = await AsyncStorage.getItem(key);
  return data ? JSON.parse(data) : [];
};

// ==============================
// TOGGLE FAVOURITE
// ==============================
export const toggleFavourite = async (id: number) => {
  const key = await getKey();
  const favs = await getFavourites();

  let updated;

  if (favs.includes(id)) {
    updated = favs.filter((f: number) => f !== id);
  } else {
    updated = [...favs, id];
  }

  await AsyncStorage.setItem(key, JSON.stringify(updated));
};

// ==============================
// CHECK FAVOURITE
// ==============================
export const isFavouriteStation = async (id: number) => {
  const favs = await getFavourites();
  return favs.includes(id);
};