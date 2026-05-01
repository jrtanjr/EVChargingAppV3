import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, FlatList, ActivityIndicator } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

import { getStations, getConnectorsByStation } from '../../services/database/stationService';

import StationCard from '../../components/reusable/StationCard';

export default function ScanScreen({ navigation }: any) {
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [stations, setStations] = useState<any[]>([]);
  const [connectorsMap, setConnectorsMap] = useState<any>({});

  // ==============================
  // START SCAN
  // ==============================
  const handleScan = async () => {
    setLoading(true);

    setTimeout(async () => {
      const data = await getStations();

      const map: any = {};

      for (const station of data) {
        const connectors = await getConnectorsByStation(station.id);
        map[station.id] = connectors;
      }

      setStations(data);
      setConnectorsMap(map);

      setLoading(false);
      setModalVisible(true);
    }, 1500);
  };

  // ==============================
  // SELECT STATION
  // ==============================
  const handleSelect = (station: any) => {
    setModalVisible(false);

    navigation.navigate('Map', {
      screen: 'MapMain',
      params: {
        station,
        trigger: Date.now(), 
      },
    });
  };

  // ==============================
  // RENDER ITEM
  // ==============================
  const renderItem = ({ item }: any) => {
    const connectors = connectorsMap[item.id] || [];

    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() => handleSelect(item)}
      >
        <Text style={styles.name}>{item.name}</Text>

        <StationCard
          station={item}
          connectors={connectors}
        />
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      {/* ICON */}
      <Icon name="qrcode-scan" size={120} color="#22c55e" />

      <Text style={styles.title}>Scan to Start Charging</Text>

      {/* BUTTON */}
      <TouchableOpacity style={styles.scanBtn} onPress={handleScan}>
        <Text style={styles.btnText}>Scan QR</Text>
      </TouchableOpacity>

      {/* LOADING OVERLAY */}
      {loading && (
        <View style={styles.overlay}>
          <ActivityIndicator size="large" color="#22c55e" />
          <Text style={styles.loadingText}>Scanning...</Text>
        </View>
      )}

      {/* STATION LIST MODAL */}
      <Modal visible={modalVisible} animationType="slide">
        <View style={styles.modalContainer}>
          <Text style={styles.modalTitle}>Select Station</Text>

          <FlatList
            data={stations}
            keyExtractor={(item) => item.id.toString()}
            renderItem={renderItem}
            contentContainerStyle={{ padding: 15 }}
          />

          <TouchableOpacity
            style={styles.closeBtn}
            onPress={() => setModalVisible(false)}
          >
            <Text style={styles.btnText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#020617',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },

  title: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 25,
    marginBottom: 25,
  },

  scanBtn: {
    backgroundColor: '#22c55e',
    padding: 20,
    borderRadius: 10,
    marginTop: 10,
  },

  btnText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 20,
  },

  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.7)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  loadingText: {
    color: 'white',
    marginTop: 10,
    fontWeight: 'bold',
    fontSize: 20,
  },

  modalContainer: {
    flex: 1,
    backgroundColor: '#020617',
  },

  modalTitle: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 20,
  },

  card: {
    backgroundColor: '#1f2937',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
  },

  name: {
    color: 'white',
    fontWeight: 'bold',
  },

  address: {
    color: '#9ca3af',
    marginTop: 4,
  },

  closeBtn: {
    backgroundColor: '#ef4444',
    padding: 15,
    margin: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
});