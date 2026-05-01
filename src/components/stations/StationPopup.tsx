import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Linking  } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useFocusEffect } from '@react-navigation/native';

import { toggleFavourite, isFavouriteStation } from '../../services/storage/favouriteService';
import { getConnectorsByStation } from '../../services/database/stationService';


import StationCard from '../reusable/StationCard';

export default function StationPopup({ station, userLocation, onClose, navigation }: any) {
  const [connectors, setConnectors] = useState<any[]>([]);
  const [isFavourite, setIsFavourite] = useState(false);

  useEffect(() => {
    loadConnectors();
  }, [station.id]);

  useFocusEffect(
      React.useCallback(() => {
        loadFavourite();
      }, [station.id])
    );

  const loadFavourite = async () => {
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
    setIsFavourite(prev => !prev);
  };

  const handleGetDirection = () => {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${station.latitude},${station.longitude}`;
    Linking.openURL(url);
  };
  


  return (
    <View style={styles.popup}>

      {/* HEADER */}
      <View style={styles.headerRow}>
        <Text style={styles.title} numberOfLines={2}>
          {station.name}
        </Text>

        <TouchableOpacity onPress={handleToggleFavourite}>
          <Icon
            name={isFavourite ? 'star' : 'star-outline'}
            size={25}
            color="#facc15"
          />
        </TouchableOpacity>
      </View>

      <StationCard
        station={station}
        connectors={connectors}
        userLocation={userLocation}
      />

      {/* BUTTON */}
      <View style={styles.buttonRow}>

        {/* Direction Button */}
        <TouchableOpacity
          style={styles.directionBtn}
          onPress={handleGetDirection}
        >
          <Icon name="map-marker-path" size={18} color="white" />
          <Text style={styles.directionText}>Direction</Text>
        </TouchableOpacity>

        {/* Start Charging */}
        {station.available_ports > 0 ? (
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

    </View>
  );
}

const styles = StyleSheet.create({

  popup: {
    position: 'absolute',
    bottom: 60,
    left: 20,
    right: 20,
    backgroundColor: '#1f2937',
    borderRadius: 14,
    padding: 14,
  },

  headerRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },

  title: {
    flex: 1,
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },

  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
  },

  directionBtn: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#3b82f6',
    padding: 10,
    borderRadius: 10,
    marginRight: 10,
  },

  directionText: {
    color: 'white',
    fontWeight: 'bold',
    marginLeft: 6,
  },

  startButton: {
    flex: 1,
    backgroundColor: '#15743c',
    padding: 10,
    borderRadius: 10,
    alignItems: 'center',
  },

  disabledButton: {
    flex: 1,
    backgroundColor: '#374151',
    padding: 12,
    borderRadius: 10,
    alignItems: 'center',
  },

  startButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },

  disabledText: {
    color: '#9ca3af',
    fontWeight: 'bold',
  },
  
});