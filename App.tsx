import React, { useEffect, useState } from 'react';
import AppNavigator from './src/navigation/AppNavigator';
import { initDatabase } from './src/database/schema';

export default function App() {
  const [dbReady, setDbReady] = useState(false);

  useEffect(() => {
    const setup = async () => {
      await initDatabase();
      setDbReady(true);
    };

    setup();
  }, []);

  if (!dbReady) return null;

  return <AppNavigator />;
}