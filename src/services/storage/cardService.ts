import AsyncStorage from '@react-native-async-storage/async-storage';

const KEY = 'linked_card';

export const saveCard = async (card: any) => {
  await AsyncStorage.setItem(KEY, JSON.stringify(card));
};

export const getCard = async () => {
  const data = await AsyncStorage.getItem(KEY);
  return data ? JSON.parse(data) : null;
};

export const removeCard = async () => {
  await AsyncStorage.removeItem(KEY);
};