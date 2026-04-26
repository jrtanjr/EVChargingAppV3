import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

export default function TopBar({ navigation }: any) {
  return (
    <View style={styles.container}>
      
      <TouchableOpacity onPress={() => navigation.openDrawer()}>
        <Icon name="menu" size={24} />
      </TouchableOpacity>

      <Text style={styles.title}>EV Charging</Text>

      <TouchableOpacity>
        <Icon name="bell-outline" size={26} />
      </TouchableOpacity>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'center',
},
  title: {
    fontWeight: 'bold',
    fontSize: 16,
  },
});