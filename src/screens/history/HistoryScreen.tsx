import React, { useState } from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';

import { getChargingHistory } from '../../services/database/chargingService';

export default function HistoryScreen() {
  const [data, setData] = useState<any[]>([]);

  useFocusEffect(
    React.useCallback(() => {
      load();
    }, [])
  );

  const load = async () => {
    const history = await getChargingHistory();
    setData(history);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  const getStatusLabel = (status: string) => {
    if (status === 'completed') return 'Fully Charged';
    if (status === 'stopped') return 'Partial Charge';
    return status;
  };

  const renderItem = ({ item }: any) => (
    <View style={styles.card}>

      {/* HEADER */}
      <Text style={styles.station}>
        {item.station_name || 'Unknown Station'}
      </Text>

      {/* ADDRESS */}
      <Text style={styles.address}>
        {item.address || 'Unknown Address'}
      </Text>

      {/* TIME */}
      <Text style={styles.time}>
        {formatDate(item.timestamp)}
      </Text>

      {/* INFO ROW */}
      <View style={styles.row}>
        <Text style={styles.energy}>
          ⚡ {item.energy.toFixed(2)} kWh
        </Text>

        <Text style={styles.cost}>
          RM {item.cost.toFixed(2)}
        </Text>
      </View>

      {/*DURATION*/}
      <Text style={styles.duration}>
        Duration: {item.duration || 'Unknown'} minutes
      </Text>

      {/* STATUS */}
      <Text style={[
        styles.status,
        {
          color:
            item.status === 'completed'
              ? '#22c55e'
              : '#bd6f08',
        },
      ]}>
        {getStatusLabel(item.status)}
      </Text>

    </View>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={data}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderItem}
        contentContainerStyle={{ padding: 15 }}

        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>
              No charging history yet.
            </Text>
           </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },

  card: {
    backgroundColor: '#222222',
    padding: 15,
    borderRadius: 12,
    marginBottom: 12,
    elevation: 20,
  },

  station: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },

  time: {
    color: '#9ca3af',
    fontSize: 12,
    marginTop: 2,
    marginBottom: 10,
  },

  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },

  energy: {
    color: 'white',
  },

  cost: {
    color: '#22c55e',
    fontWeight: 'bold',
  },

  status: {
    fontSize: 12,
    fontWeight: 'bold',
  },

  address: {
    color: '#9ca3af',
    fontSize: 12,
    marginTop: 2,
  },

  duration: {
    color: '#9ca3af',
    fontSize: 12,
    marginBottom: 10,
  },

  emptyContainer: {
    flex: 1,
    justifyContent: "flex-start",
    alignItems: "flex-start",
  },

  emptyText: {
    color: '#6b7280',
    fontSize: 20,
    fontWeight: 'bold',
  },
});