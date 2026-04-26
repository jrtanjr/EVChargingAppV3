import React from 'react';
import { View, Text, Modal, TouchableOpacity, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

export default function FilterModal({ visible, onClose, onApply }: any) {
  return (
    <Modal visible={visible} transparent animationType="fade">

      <View style={styles.overlay}>

        <View style={styles.modal}>

          {/* HEADER */}
          <View style={styles.header}>
            <Text style={styles.title}>⚙️ Filter Chargers</Text>

            <TouchableOpacity onPress={onClose}>
              <Icon name="close" size={25} color="red" />
            </TouchableOpacity>
          </View>

          {/* OPTIONS */}

          {/* AC */}
          <TouchableOpacity
            style={styles.option}
            onPress={() => onApply({ type: 'AC' })}
          >
            <View style={[styles.iconBox, { backgroundColor: '#3b82f6' }]}>
              <Icon name="power-plug" size={16} color="white" />
            </View>

            <View style={styles.optionTextBox}>
              <Text style={styles.optionTitle}>AC Chargers</Text>
              <Text style={styles.optionDesc}>Standard charging</Text>
            </View>
          </TouchableOpacity>

          {/* DC */}
          <TouchableOpacity
            style={styles.option}
            onPress={() => onApply({ type: 'DC' })}
          >
            <View style={[styles.iconBox, { backgroundColor: '#f97316' }]}>
              <Icon name="flash" size={16} color="white" />
            </View>

            <View style={styles.optionTextBox}>
              <Text style={styles.optionTitle}>DC Fast Chargers</Text>
              <Text style={styles.optionDesc}>High-speed charging</Text>
            </View>
          </TouchableOpacity>

          {/* DIVIDER */}
          <View style={styles.divider} />

          {/* RESET */}
          <TouchableOpacity
            style={styles.reset}
            onPress={() => onApply({ type: 'ALL' })}
          >
            <Icon name="refresh" size={16} color="#ef4444" />
            <Text style={styles.resetText}>Clear Filter</Text>
          </TouchableOpacity>

        </View>

      </View>

    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },

  modal: {
    margin: 20,
    padding: 20,
    backgroundColor: '#222222',
    borderRadius: 20,
  },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },

  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
  },

  // ===============================
  // OPTIONS (CARD STYLE)
  // ===============================
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    backgroundColor: '#f3f4f6',
    marginBottom: 10,
  },

  iconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },

  optionTextBox: {
    marginLeft: 10,
  },

  optionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#111827',
  },

  optionDesc: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#6b7280',
  },

  divider: {
    height: 1,
    backgroundColor: '#e5e7eb',
    marginVertical: 5,
  },

  reset: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 5,
    marginBottom: -5,
  },

  resetText: {
    marginLeft: 6,
    color: '#ef4444',
    fontWeight: 'bold',
    fontSize: 16,
  },
});