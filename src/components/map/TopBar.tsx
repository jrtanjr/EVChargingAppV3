import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

export default function TopBar({ navigation }: any) {
  return (
    <View style={styles.container}>
      
      {/* LEFT: MENU */}
      <TouchableOpacity
        onPress={() => navigation.openDrawer()}
        style={styles.menu}
      >
        <Icon name="menu" size={30} color="white" />
      </TouchableOpacity>

      {/* CENTER: ICON + TITLE */}
      <View style={styles.center}>
        <Image
          source={require('../../Icon/EZChargeEV_Icon.png')}
          style={styles.logo}
        />
        <Text style={styles.title}>EZChargeEV</Text>
      </View>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 65,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center', 

    backgroundColor: '#020617',
  },

  menu: {
    position: 'absolute',
    left: 16,
  },

  center: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  logo: {
    width: 40,
    height: 40,
    marginRight: 8,
    borderRadius: 6,
    justifyContent: 'center', // smooth icon look
  },

  title: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 20,
  },
});