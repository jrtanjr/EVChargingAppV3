import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { View, Text } from 'react-native';

import MapScreen from '../screens/map/MapScreen';
import ChargingScreen from '../screens/charging/ChargingScreen';
import ChargingResultScreen from '../screens/charging/ChargingResultScreen';
import PaymentSelectionScreen from '../screens/payment/PaymentSelectionScreen';
import AddCardScreen from '../screens/payment/AddCardScreen';

const Stack = createStackNavigator();


export default function MapStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="MapMain" component={MapScreen} />
      <Stack.Screen name="PaymentSelection" component={PaymentSelectionScreen} />
      <Stack.Screen name="AddCard" component={AddCardScreen} />
      <Stack.Screen name="ChargingScreen" component={ChargingScreen} />
      <Stack.Screen name="ChargingResult" component={ChargingResultScreen} />
    </Stack.Navigator>
  );
}