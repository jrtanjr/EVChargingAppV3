import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, StyleSheet, Text } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

import MapStack from './MapStack';
import FavouriteScreen from '../screens/favourite/FavouriteScreen';
import ScanScreen from '../screens/scan/ScanScreen';
import StationsScreen from '../screens/stations/StationsScreen';
import ProfileScreen from '../screens/profile/ProfileScreen';

const Tab = createBottomTabNavigator();

export default function BottomTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarShowLabel: false,

        tabBarStyle: {
          height: 75,
          backgroundColor: '#020617', //    match drawer
          borderTopWidth: 0,
          elevation: 10,
        },

        tabBarIcon: ({ focused }) => {
          let iconName = '';
          let label = '';

          if (route.name === 'Map') {
            iconName = 'map';
            label = 'Map';
          }

          if (route.name === 'Favourite') {
            iconName = 'star';
            label = 'Favourite';
          }

          if (route.name === 'Stations') {
            iconName = 'ev-station';
            label = 'Stations';
          }

          if (route.name === 'Profile') {
            iconName = 'account';
            label = 'Profile';
          }

          return (
            <View style={styles.tabItem}>
              <Icon
                name={iconName}
                size={30}
                color={focused ? '#ffffff' : '#64748b'} //    white / gray
              />
              <Text style={styles.label}>{label}</Text>
            </View>
          );
        },
      })}
    >
      <Tab.Screen name="Map" component={MapStack} />
      <Tab.Screen name="Favourite" component={FavouriteScreen} />

      {/*    SCAN BUTTON */}
      <Tab.Screen
        name="Scan"
        component={ScanScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <View style={styles.scanWrapper}>
              <View
                style={[
                  styles.scanButton,
                  {
                    backgroundColor: focused ? '#15743c' : '#1e293b', //    dark gray idle
                    transform: [{ scale: focused ? 1.1 : 1 }],
                  },
                ]}
              >
                <Icon
                  name="qrcode-scan"
                  size={28}
                  color="#ffffff" //    always white
                />
              </View>

              <Text style={styles.label}>Scan</Text>
            </View>
          ),
        }}
      />

      <Tab.Screen name="Stations" component={StationsScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  tabItem: {
    alignItems: 'center',
    justifyContent: 'center',
  },

  label: {
    fontSize: 12,
    marginTop: 5,
    fontWeight: 'bold',
    color: '#ffffff', //    always white
  },

  //    Scan button styles
  scanWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -10,
  },

  scanButton: {
    width: 65,
    height: 65,
    borderRadius: 35,

    justifyContent: 'center',
    alignItems: 'center',

    elevation: 6,
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 5,
  },
});