import React from 'react';
import { createDrawerNavigator, DrawerContentScrollView, DrawerItem } from '@react-navigation/drawer';
import { View, Text, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

import BottomTabs from './BottomTabs';
import DrawerStack from './DrawerStack';

const Drawer = createDrawerNavigator();

/* ==============================
   CUSTOM DRAWER UI
============================== */
function CustomDrawerContent(props: any) {
  return (
    <DrawerContentScrollView {...props}>

      {/* 🔥 HEADER */}
      <View style={styles.drawerHeader}>
        <Icon name="account-circle" size={50} color="#15743c" />
        <Text style={styles.userName}>EV User</Text>
        <Text style={styles.userEmail}>user@email.com</Text>
      </View>

      {/* 🔥 MENU ITEMS */}
      <DrawerItem
        label="Home"
        icon={({ color }) => <Icon name="home" size={22} color={color} />}
        onPress={() => props.navigation.navigate('Home')}
      />

      <DrawerItem
        label="Charging History"
        icon={({ color }) => <Icon name="history" size={22} color={color} />}
        onPress={() =>
          props.navigation.navigate('Charging History', {
            screen: 'History',
          })
        }
      />

      <DrawerItem
        label="Payment & Wallet"
        icon={({ color }) => (
          <Icon name="account-balance-wallet" size={22} color={color} />
        )}
        onPress={() =>
          props.navigation.navigate('Payment & Wallet', {
            screen: 'Payment',
          })
        }
      />

      <DrawerItem
        label="Help"
        icon={({ color }) => <Icon name="help-outline" size={22} color={color} />}
        onPress={() =>
          props.navigation.navigate('Help', {
            screen: 'Help',
          })
        }
      />

      <DrawerItem
        label="Terms"
        icon={({ color }) => <Icon name="description" size={22} color={color} />}
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
        icon={({ color }) => <Icon name="logout" size={22} color={color} />}
        onPress={() => console.log('Logout pressed')}
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
        drawerActiveTintColor: '#15743c',
        drawerInactiveTintColor: 'gray',
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
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    marginBottom: 10,
  },

  userName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 10,
  },

  userEmail: {
    fontSize: 12,
    color: 'gray',
  },

  divider: {
    height: 1,
    backgroundColor: '#eee',
    marginVertical: 10,
  },
});