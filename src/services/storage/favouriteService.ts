import AsyncStorage from '@react-native-async-storage/async-storage';

const KEY = 'favourites';

export const getFavourites = async () => {
  const data = await AsyncStorage.getItem(KEY);
  return data ? JSON.parse(data) : [];
};

export const toggleFavourite = async (id: number) => {
  const favs = await getFavourites();

  let updated;

  if (favs.includes(id)) {
    updated = favs.filter((f: number) => f !== id);
  } else {
    updated = [...favs, id];
  }

  await AsyncStorage.setItem(KEY, JSON.stringify(updated));
};

export const isFavouriteStation = async (id: number) => {
  const favs = await getFavourites();
  return favs.includes(id);
};