import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { View, Text } from 'react-native';

import MapScreen from '../screens/map/MapScreen';
import ChargingScreen from '../screens/charging/ChargingScreen';
import ChargingResultScreen from '../screens/charging/ChargingResultScreen';
import PaymentSelectionScreen from '../screens/payment/PaymentSelectionScreen';

const Stack = createStackNavigator();

function StationDetail() {
  return (
    <View>
      <Text>Station Detail</Text>
    </View>
  );
}

export default function MapStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="MapMain" component={MapScreen} />
      <Stack.Screen name="StationDetail" component={StationDetail} />
      <Stack.Screen name="PaymentSelection" component={PaymentSelectionScreen} />
      <Stack.Screen name="ChargingScreen" component={ChargingScreen} />
      <Stack.Screen name="ChargingResult" component={ChargingResultScreen} />
    </Stack.Navigator>
  );
}