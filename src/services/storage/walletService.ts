import AsyncStorage from '@react-native-async-storage/async-storage';
import { getCurrentUser } from '../api/authService';

const getKey = async () => {
  const user = await getCurrentUser();
  return `wallet_balance_${user?.id}`;
};

export const getBalance = async () => {
  const key = await getKey();
  const value = await AsyncStorage.getItem(key);
  return value ? parseFloat(value) : 0;
};

export const setBalance = async (amount: number) => {
  const key = await getKey();
  await AsyncStorage.setItem(key, amount.toString());
};

export const topUp = async (amount: number) => {
  const current = await getBalance();
  const newBalance = current + amount;
  await setBalance(newBalance);
  return newBalance;
};

export const deduct = async (amount: number) => {
  const current = await getBalance();
  const newBalance = current - amount;
  await setBalance(newBalance);
  return newBalance;
};
