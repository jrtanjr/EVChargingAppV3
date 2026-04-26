import SQLite from 'react-native-sqlite-storage';

SQLite.enablePromise(true);

const database_name = 'evcharging.db';

export const getDBConnection = async () => {
  return SQLite.openDatabase({
    name: database_name,
    location: 'default',
  });
};