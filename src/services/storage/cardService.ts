import AsyncStorage from '@react-native-async-storage/async-storage';
import { getCurrentUser } from '../api/authService';

const getKey = async () => {
  const user = await getCurrentUser();
  return `card_${user?.id}`;
};

export const getCard = async () => {
  const key = await getKey();
  const data = await AsyncStorage.getItem(key);
  return data ? JSON.parse(data) : null;
};

export const saveCard = async (card: any) => {
  const key = await getKey();
  await AsyncStorage.setItem(key, JSON.stringify(card));
};

export const removeCard = async () => {
  const key = await getKey();
  await AsyncStorage.removeItem(key);
};