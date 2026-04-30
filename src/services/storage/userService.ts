import AsyncStorage from '@react-native-async-storage/async-storage';

const USER_KEY = 'user_id';

export const getUserId = async () => {
  let id = await AsyncStorage.getItem(USER_KEY);

  if (!id) {
    id = 'user-' + Date.now(); // simple unique id
    await AsyncStorage.setItem(USER_KEY, id);
  }

  return id;
};