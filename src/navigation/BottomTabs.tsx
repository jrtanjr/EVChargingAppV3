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
        },

        tabBarActiveTintColor: '#15743c',
        tabBarInactiveTintColor: 'gray',

        tabBarIcon: ({ color }) => {
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
              <Icon name={iconName} size={24} color={color} />
              <Text style={[styles.label, { color }]}>{label}</Text>
            </View>
          );
        },
      })}
    >
      <Tab.Screen name="Map" component={MapStack} />
      <Tab.Screen name="Favourite" component={FavouriteScreen} />

      {/* 🔥 SCAN BUTTON */}
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
                    backgroundColor: focused ? '#15743c' : '#ccc',
                    transform: [{ scale: focused ? 1.1 : 1 }],
                  },
                ]}
              >
                <Icon
                  name="qrcode-scan"
                  size={28}
                  color={focused ? 'white' : '#555'}
                />
              </View>

              <Text
                style={[
                  styles.scanLabel,
                  { color: focused ? '#15743c' : 'gray' },
                ]}
              >
                Scan
              </Text>
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
    fontSize: 11,
    marginTop: 5,
    fontWeight: 'bold',
  },

  // 🔥 Scan button styles
  scanWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -10, // 🔥 lift up entire scan button
  },

  scanButton: {
    width: 65,
    height: 65,
    borderRadius: 35,

    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
  },

  scanLabel: {
    fontSize: 11,
    marginTop: 2, // tighter spacing
    fontWeight: 'bold',
  },
});