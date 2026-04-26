import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

import { toggleFavourite, isFavouriteStation } from '../../services/storage/favouriteService';
import { getConnectorsByStation } from '../../services/database/stationService';

export default function StationPopup({ station, onClose, navigation }: any) {
  const [connectors, setConnectors] = useState<any[]>([]);
  const [isFavourite, setIsFavourite] = useState(false);

  useEffect(() => {
    loadConnectors();
    loadFavourite(); 
  }, [station.id]);

  const loadFavourite = async () => { // check if station is favourite
    const result = await isFavouriteStation(station.id);
    setIsFavourite(result);
  };

  const loadConnectors = async () => {
    try {
      const data = await getConnectorsByStation(station.id);
      setConnectors(data);
    } catch (error) {
      console.log("CONNECTOR ERROR:", error);
    }
  };

  const handleToggleFavourite = async () => {
    await toggleFavourite(station.id);
    setIsFavourite(prev => !prev); // instant UI update
  };

  // AC Connectors
  const ac = connectors.filter(c =>
    c.current_type?.toUpperCase().includes('AC')
  );

  const acTotal = ac.reduce((sum, c) => sum + c.quantity, 0);

  const acAvailable = ac.reduce((sum, c) => sum + c.available, 0);

  const acPower =
    ac.length > 0 ? Math.max(...ac.map(c => c.power_kw || 0)) : 0;

  // DC Connectors
  const dc = connectors.filter(c =>
    c.current_type?.toUpperCase().includes('DC')
  );

  const dcTotal = dc.reduce((sum, c) => sum + c.quantity, 0);

  const dcAvailable = dc.reduce((sum, c) => sum + c.available, 0);

  const dcPower =
    dc.length > 0 ? Math.max(...dc.map(c => c.power_kw || 0)) : 0;

  

  return (
    <View style={styles.popup}>
      <View style={styles.header}>
      <Text 
        style={styles.title}
        numberOfLines={2}
        ellipsizeMode='tail'
      >
        {station.name}
      </Text>
      <Text style={styles.address}>
        {station.address}
      </Text>
    </View>

      {/* AC Info */}
      {acTotal > 0 && (
        <View style={styles.infoRow}>
          <Icon name="power-plug" size={18} color="#3b82f6" />

          <Text style={styles.infoText}>
            AC • {acPower} kW
          </Text>

          <View style={[styles.badge, { backgroundColor: '#3b82f6' }]}>
            <Text style={styles.badgeText}>
              {acAvailable} / {acTotal}
            </Text>
          </View>
        </View>
      )}

      {/* DC Info */}
      {dcTotal > 0 && (
        <View style={styles.infoRow}>
          <Icon name="flash" size={18} color="#f97316" />

          <Text style={styles.infoText}>
            DC • {dcPower} kW
          </Text>

          <View style={[styles.badge, { backgroundColor: '#f97316' }]}>
            <Text style={styles.badgeText}>
              {dcAvailable} / {dcTotal}
            </Text>
          </View>
        </View>
      )}

      {/* Favourite Button */}
      <TouchableOpacity
        style={styles.favButton}
        onPress={handleToggleFavourite}
      >
        <Icon
          name={isFavourite ? 'star' : 'star-outline'}
          size={30}
          color="#f1c40f"
        />
      </TouchableOpacity>

      {/* Charge Button */}
      {station.available_ports > 0 ? ( // only show if has available ports
        <TouchableOpacity
          style={styles.startButton}
          onPress={async () => { 
            const connectors = await getConnectorsByStation(station.id);

            onClose();

            navigation.navigate('PaymentSelection', { 
              station,
              connectors,
            });
          }}
        >
          <Text style={styles.startButtonText}>Start Charging</Text>
        </TouchableOpacity>
      ) : (
        <View style={styles.disabledButton}>
          <Text style={styles.disabledText}>Station Fully Occupied</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({

  popup: {
    position: 'absolute',
    bottom: 40,
    left: 20,
    right: 20,
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 10,
    elevation: 5,
  },

  header: {
    paddingRight: 40, // space for fav button
  },

  title: {
    fontWeight: 'bold',
    fontSize: 16,
    marginBottom: 5,
  },

  address: {
    marginBottom: 8,
    color: '#555',
  },

  startButton: {
    marginTop: 10,
    backgroundColor: '#15743c',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },

  startButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },

  disabledButton: {
    marginTop: 10,
    backgroundColor: '#ccc',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },

  disabledText: {
    color: '#555',
    fontWeight: 'bold',
  },

  favButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    zIndex: 10,
  },

  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
    paddingVertical: 6,
  },

  infoText: {
    flex: 1,
    marginLeft: 8,
    fontSize: 14,
    fontWeight: '500',
  },

  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },

  badgeText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 12,
  },
});