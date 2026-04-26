import React from 'react';
import { View, TextInput, StyleSheet, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

export default function SearchBar({ value, onChange, onFilterPress }: any) {
  return (
    <View style={styles.container}>

      {/* 🔍 Search Icon */}
      <Icon name="magnify" size={20} color="#9ca3af" style={styles.icon} />

      {/* INPUT */}
      <TextInput
        placeholder="Search EV stations..."
        placeholderTextColor="#9ca3af"
        value={value}
        onChangeText={onChange}
        style={styles.input}
      />

      {/* ❌ Clear Button */}
      {value?.length > 0 && (
        <TouchableOpacity onPress={() => onChange('')}>
          <Icon name="close-circle" size={20} color="#9ca3af" />
        </TouchableOpacity>
      )}

      {/* ⚙️ Filter Button */}
      <TouchableOpacity onPress={onFilterPress} style={styles.filterBtn}>
        <Icon name="tune" size={20} color="white" />
      </TouchableOpacity>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
  flexDirection: 'row',
  alignItems: 'center',
  backgroundColor: '#fafcff',
  borderRadius: 30,
  paddingHorizontal: 12,
  paddingVertical: 8,

  shadowColor: '#000',
  shadowOpacity: 0.2,
  shadowRadius: 6,
  elevation: 4,
},

icon: {
  marginRight: 6,
},

input: {
  flex: 1,
  color: 'black',
  fontSize: 16,
},

filterBtn: {
  marginLeft: 8,
  backgroundColor: '#5f5f5f',
  padding: 6,
  borderRadius: 20,
},

});