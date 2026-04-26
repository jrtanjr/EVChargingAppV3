import AsyncStorage from '@react-native-async-storage/async-storage';

const KEY = 'wallet_balance';

export const getBalance = async () => {
  const data = await AsyncStorage.getItem(KEY);
  return data ? parseFloat(data) : 0;
};

export const setBalance = async (amount: number) => {
  await AsyncStorage.setItem(KEY, amount.toString());
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

export const adjustBalance = async (amount: number) => {
  const current = await getBalance();
  const newBalance = current + amount; // can be negative
  await setBalance(newBalance);
  return newBalance;
};