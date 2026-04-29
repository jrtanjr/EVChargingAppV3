import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

export default function ChargingResultScreen({ route, navigation }: any) {
  const { energy = 0, chargingCost = 0, idleCost = 0 } = route.params || {};

  const total = chargingCost + idleCost;

  return (
    <View style={styles.container}>

      {/* TITLE */}
      <Text style={styles.title}>Charging Complete</Text>

      {/* RESULT CARD */}
      <View style={styles.card}>

        <View style={styles.row}>
          <Text style={styles.label}>Energy Used</Text>
          <Text style={styles.value}>
            {energy.toFixed(2)} kWh
          </Text>
        </View>

        <View style={styles.row}>
          <Text style={styles.label}>Charging Cost</Text>
          <Text style={styles.value}>
            RM {chargingCost.toFixed(2)}
          </Text>
        </View>

        <View style={styles.row}>
          <Text style={styles.label}>Idle Fee</Text>
          <Text style={styles.value}>
            RM {idleCost.toFixed(2)}
          </Text>
        </View>

        {/* Divider */}
        <View style={styles.divider} />

        <View style={styles.row}>
          <Text style={styles.totalLabel}>Total</Text>
          <Text style={styles.totalValue}>
            RM {total.toFixed(2)}
          </Text>
        </View>

      </View>

      {/* BUTTON */}
      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.popToTop()}
      >
        <Text style={styles.btnText}>Back to Map</Text>
      </TouchableOpacity>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },

  title: {
    color: 'white',
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20,
  },

  card: {
    backgroundColor: '#1f2937',
    padding: 20,
    borderRadius: 12,
    width: '90%',
  },

  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },

  label: {
    color: '#9ca3af',
  },

  value: {
    color: 'white',
    fontWeight: 'bold',
  },

  divider: {
    height: 1,
    backgroundColor: '#374151',
    marginVertical: 10,
  },

  totalLabel: {
    color: 'white',
    fontWeight: 'bold',
  },

  totalValue: {
    color: '#22c55e',
    fontWeight: 'bold',
  },

  button: {
    marginTop: 25,
    backgroundColor: '#15743c',
    padding: 14,
    borderRadius: 10,
    width: '90%',
    alignItems: 'center',
  },

  btnText: {
    color: 'white',
    fontWeight: 'bold',
  },
});