import React from 'react';
import { TouchableOpacity, View, Text, Image, StyleSheet } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Icon from 'react-native-vector-icons/MaterialIcons';

import HistoryScreen from '../screens/history/HistoryScreen';
import PaymentScreen from '../screens/payment/PaymentScreen';
import HelpScreen from '../screens/help/HelpScreen';
import TermsScreen from '../screens/terms/TermsScreen';


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
        headerStyle: {
          backgroundColor: '#292929',
        },
        headerTintColor: '#ffffff',
        headerTitleAlign: 'center',

        
        headerLeft: () => (
            <TouchableOpacity
            onPress={() => navigation.openDrawer()}
            style={styles.menuButton}
            >
            <Icon name="menu" size={30} color = 'white' />
            </TouchableOpacity>
        ),
        })}
    >
      <Stack.Screen
        name="DrawerStackScreen"
        component={ScreenComponent}
        options={{
          headerTitle: () => (
            <View style={styles.headerCenter}>
              <Image
                source={require('../Icon/EZChargeEV_Icon.png')}
                style={styles.headerIcon}
              />
              <Text style={styles.headerTitle}>{screen}</Text>
            </View>
          ),
        }}
      />
    </Stack.Navigator>
  );
}

const styles=StyleSheet.create({

headerCenter: {
  flexDirection: 'row',
  alignItems: 'center',
},

headerIcon: {
  width: 40,
  height: 40,
  borderRadius: 6,
  marginRight: 8,
},

headerTitle: {
  color: '#ffffff',
  fontSize: 20,
  fontWeight: 'bold',
},

menuButton: {
  padding: 6,
},

});