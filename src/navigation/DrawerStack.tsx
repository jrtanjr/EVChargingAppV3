import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Icon from 'react-native-vector-icons/MaterialIcons';

import HistoryScreen from '../screens/history/HistoryScreen';
import PaymentScreen from '../screens/payment/PaymentScreen';
import HelpScreen from '../screens/help/HelpScreen';
import TermsScreen from '../screens/terms/TermsScreen';
import { TouchableOpacity } from 'react-native';

const Stack = createNativeStackNavigator();

export default function DrawerStack({ route }: any) {
  const { screen } = route.params;

  const getComponent = () => {
    switch (screen) {
      case 'History':
        return HistoryScreen;
      case 'Payment':
        return PaymentScreen;
      case 'Help':
        return HelpScreen;
      case 'Terms':
        return TermsScreen;
      default:
        return HistoryScreen;
    }
  };

  const ScreenComponent = getComponent();

  return (
    <Stack.Navigator
      screenOptions={({ navigation }) => ({
        headerShown: true,
        headerStyle: { backgroundColor: '#ffffff' },
        headerTintColor: '#000',
        headerTitleAlign: 'center',

        
        headerLeft: () => (
            <TouchableOpacity
            onPress={() => navigation.openDrawer()}
            style={{ marginLeft: 1}}
            >
            <Icon name="menu" size={26} />
            </TouchableOpacity>
        ),
        })}
    >
      <Stack.Screen
        name="DrawerStackScreen"
        component={ScreenComponent}
        options={{
          title: screen,
        }}
      />
    </Stack.Navigator>
  );
}