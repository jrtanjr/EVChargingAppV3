import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import DrawerNavigator from './DrawerNavigator';
import LoginScreen from '../screens/auth/LoginScreen';

import { supabase } from '../services/api/supabaseClient';

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // ===============================
  // CHECK INITIAL SESSION
  // ===============================
  useEffect(() => {
    const getSession = async () => {
      const { data } = await supabase.auth.getSession();
      setUser(data.session?.user ?? null);
      setLoading(false);
    };

    getSession();
  }, []);

  // ===============================
  // LISTEN TO AUTH STATE CHANGE
  // ===============================
  useEffect(() => {
    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null);
      }
    );

    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  // ===============================
  // LOADING STATE
  // ===============================
  if (loading) return null;

  // ===============================
  // NAVIGATION
  // ===============================
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>

        {user ? (
          //    USER LOGGED IN
          <Stack.Screen
            name="Main"
            component={DrawerNavigator}
          />
        ) : (
          // 🔐 NOT LOGGED IN
          <Stack.Screen
            name="Login"
            component={LoginScreen}
          />
        )}

      </Stack.Navigator>
    </NavigationContainer>
  );
}