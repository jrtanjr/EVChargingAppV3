import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

export default function TopBar({ navigation }: any) {
  return (
    <View style={styles.container}>
      
      {/* LEFT: MENU */}
      <TouchableOpacity onPress={() => navigation.openDrawer()}>
        <Icon name="menu" size={26} color="white" />
      </TouchableOpacity>

      {/* CENTER: ICON + TITLE */}
      <View style={styles.center}>
        <Image
          source={require('../../Icon/EZChargeEV_Icon.png')}
          style={styles.logo}
        />
        <Text style={styles.title}>EZChargeEV</Text>
      </View>

      {/* RIGHT: NOTIFICATION */}
      <TouchableOpacity>
        <Icon name="bell-outline" size={24} color="white" />
      </TouchableOpacity>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    
    paddingHorizontal: 16,
    paddingVertical: 12,

    backgroundColor: '#0f172a', 
  },

  center: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  logo: {
    width: 28,
    height: 28,
    marginRight: 8,
    borderRadius: 6, // smooth icon look
  },

  title: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 18,
  },
});