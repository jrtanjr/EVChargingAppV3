import React from 'react';
import { useEffect, useState } from 'react';
import { createDrawerNavigator, DrawerContentScrollView, DrawerItem } from '@react-navigation/drawer';
import { View, Text, StyleSheet, Image } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

import { getCurrentUser, logout } from '../services/api/authService';

import BottomTabs from './BottomTabs';
import DrawerStack from './DrawerStack';

const Drawer = createDrawerNavigator();

/* ==============================
   CUSTOM DRAWER UI
============================== */
function CustomDrawerContent(props: any) {
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    const u = await getCurrentUser();
    setUser(u);
  };

  return (
    <DrawerContentScrollView {...props}>

      {/* 🔥 HEADER */}
      <View style={styles.drawerHeader}>

      {/* 🔥 APP BRANDING */}
      <Image
        source={require('../Icon/EZChargeEV_Icon.png')}
        style={styles.appIconLarge}
      />
      <Text style={styles.appName}>EZChargeEV</Text>

      {/* USER INFO */}
      <Text style={styles.userName}>
        {user?.email?.split('@')[0] || 'EV User'}
      </Text>

      <Text style={styles.userEmail}>
        {user?.email || 'No email'}
      </Text>
    </View>

      {/* 🔥 MENU ITEMS */}
      <DrawerItem
        label="Home"
        icon={({ focused }) => (
          <Icon
            name="home"
            size={26}
            color={focused ? '#22c55e' : '#e2e8f0'}
          />
        )}
        labelStyle={styles.drawerLabel}
        onPress={() => props.navigation.navigate('Home')}
      />

      <DrawerItem
        label="Charging History "
        icon={({ focused }) => (
          <Icon
            name="history"
            size={26}
            color={focused ? '#22c55e' : '#e2e8f0'}
          />
        )}
        labelStyle={styles.drawerLabel}
        onPress={() =>
          props.navigation.navigate('Charging History', {
            screen: 'History',
          })
        }
      />

      <DrawerItem
        label="Payment & Wallet"
        icon={({ focused }) => (
          <Icon
            name="account-balance-wallet"
            size={26}
            color={focused ? '#22c55e' : '#e2e8f0'}
          />
        )}
        labelStyle={styles.drawerLabel}
        onPress={() =>
          props.navigation.navigate('Payment & Wallet', {
            screen: 'Payment',
          })
        }
      />

      <DrawerItem
        label="Help"
        icon={({ focused }) => (
          <Icon
            name="help-outline"
            size={26}
            color={focused ? '#22c55e' : '#e2e8f0'}
          />
        )}
        labelStyle={styles.drawerLabel}
        onPress={() =>
          props.navigation.navigate('Help', {
            screen: 'Help',
          })
        }
      />

      <DrawerItem
        label="Terms"
        icon={({ focused }) => (
          <Icon
            name="description"
            size={26}
            color={focused ? '#22c55e' : '#e2e8f0'}
          />
        )}
        labelStyle={styles.drawerLabel}
        onPress={() =>
          props.navigation.navigate('Terms', {
            screen: 'Terms',
          })
        }
      />
      
      {/* 🔥 Divider */}
      <View style={styles.divider} />

      {/* 🔥 Logout */}
      <DrawerItem
        label="Logout"
        icon={() => <Icon name="logout" size={26} color="#ef4444" />}
        labelStyle={styles.logoutLabel}
        onPress={async () => {
          await logout();
        }}
      />
    </DrawerContentScrollView>
  );
}

/* ==============================
   MAIN DRAWER NAVIGATOR
============================== */
export default function DrawerNavigator() {
  return (
    <Drawer.Navigator
      screenOptions={{
        headerShown: false,
        drawerStyle: {
          backgroundColor: '#020617',
        },
        drawerActiveTintColor: '#22c55e',
        drawerInactiveTintColor: '#cbd5f5', // 🔥 brighter
        drawerLabelStyle: {
          fontWeight: '600',
          fontSize: 14,
        },
      }}
      drawerContent={(props) => <CustomDrawerContent {...props} />}
    >
      <Drawer.Screen name="Home" component={BottomTabs} />

      <Drawer.Screen
        name="Charging History"
        component={DrawerStack}
        initialParams={{ screen: 'History' }}
      />

      <Drawer.Screen
        name="Payment & Wallet"
        component={DrawerStack}
        initialParams={{ screen: 'Payment' }}
      />

      <Drawer.Screen
        name="Help"
        component={DrawerStack}
        initialParams={{ screen: 'Help' }}
      />

      <Drawer.Screen
        name="Terms"
        component={DrawerStack}
        initialParams={{ screen: 'Terms' }}
      />
    </Drawer.Navigator>
  );
}

/* ==============================
   STYLES
============================== */
const styles = StyleSheet.create({
drawerHeader: {
  paddingVertical: 30,
  paddingHorizontal: 20,
  backgroundColor: '#020617',
  borderBottomWidth: 2,
  borderBottomColor: '#ffffff',
  alignItems: 'center',
},

/* 🔥 App Branding */
appIconLarge: {
  width: 70,
  height: 70,
  borderRadius: 16,
  marginBottom: 10,
},

appName: {
  fontSize: 20,
  fontWeight: 'bold',
  color: '#22c55e',
  marginBottom: 18,
},

/* 🔥 User */
userName: {
  fontSize: 18,
  fontWeight: '600',
  color: 'white',
},

userEmail: {
  fontSize: 16,
  color: '#94a3b8',
  marginTop: 4,
  marginBottom: -10,
},

/* 🔥 Drawer Labels */
drawerLabel: {
  fontSize: 16,           
  fontWeight: '600',
  color: '#e2e8f0',      
},

logoutLabel: {
  fontSize: 16,
  fontWeight: 'bold',
  color: '#ef4444',
},

divider: {
  height: 2,
  backgroundColor: '#ffffff',
  marginVertical: 15,
},
});