import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, PermissionsAndroid } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Geolocation from '@react-native-community/geolocation';

import { getStations } from '../../services/database/stationService';
import { getFavourites, toggleFavourite } from '../../services/storage/favouriteService';
import SearchBar from '../../components/map/SearchBar';
import TopBar from '../../components/map/TopBar';
import { getDistanceKm } from '../../services/api/apiService';

export default function FavouriteScreen({ navigation }: any) {
  const [data, setData] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [userLocation, setUserLocation] = useState<any>(null);

  useFocusEffect(
    React.useCallback(() => {
      loadFavourites();
    }, [])
  );

  useEffect(() => {
    const getLocation = async () => {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
      );

      if (granted !== PermissionsAndroid.RESULTS.GRANTED) return;

      Geolocation.getCurrentPosition(
        (pos) => {
          setUserLocation({
            latitude: pos.coords.latitude,
            longitude: pos.coords.longitude,
          });
        },
        (err) => console.log(err),
        { enableHighAccuracy: true }
      );
    };

    getLocation();
  }, []);

  const loadFavourites = async () => {
    const favIds = await getFavourites();
    const stations = await getStations();

    const favStations = stations.filter((s) =>
      favIds.includes(Number(s.id))
    );

    setData(favStations);
  };

  const handleToggleFavourite = async (id: number) => {
    await toggleFavourite(id);

    setData((prev) => prev.filter((item) => item.id !== id));
  };

  // ================= FILTER =================
  const filteredData = data.filter((item) =>
    item.name?.toLowerCase().includes(search.toLowerCase())
  );

  // ================= RENDER =================
  const renderItem = ({ item }: any) => {
    const isAvailable = item.available_ports > 0;

    const distance = userLocation
      ? getDistanceKm(
          userLocation.latitude,
          userLocation.longitude,
          item.latitude,
          item.longitude
        )
      : null;

    return (
      <TouchableOpacity
        style={styles.card}
        activeOpacity={0.8}
        onPress={() => {
          navigation.navigate('Map', {
            screen: 'MapScreen',
            params: { station: item },
          });
        }}
      >
        {/* HEADER */}
        <View style={styles.headerRow}>
          <Text style={styles.name} numberOfLines={2}>
            {item.name}
          </Text>

          <TouchableOpacity
            style={styles.starBtn}
            onPress={() => handleToggleFavourite(item.id)}
          >
            <Icon name="star" size={22} color="#facc15" />
          </TouchableOpacity>
        </View>

        {/* INNER BOX */}
        <View style={styles.innerBox}>
          <Text style={styles.address}>
            {item.address || 'No address'}
          </Text>

          {/* 📍 Distance */}
          {distance && (
            <Text style={styles.distance}>
              📍 {distance.toFixed(1)} km away
            </Text>
          )}

            <View style={styles.row}>
              <Text style={styles.text}>
                <Icon name="power-plug" size={17} color="#ffffff" />
                {item.available_ports}/{item.total_ports} available
              </Text>

              <Text
                style={[
                  styles.status,
                  { color: isAvailable ? '#22c55e' : '#ef4444' },
                ]}
              >
                {isAvailable
                  ? `${item.available_ports} Available`
                  : 'Fully Occupied'}
              </Text>
            </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>

      {/* 🔍 SEARCH */}
      <View style={styles.header}>
        <SearchBar
          value={search}
          onChange={setSearch}
          placeholder="Search favourites ev stations..."
          showFilter={false}
        />
      </View>

      {/* 📋 LIST */}
      <FlatList
        data={filteredData}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderItem}
        contentContainerStyle={{ padding: 15 }}

        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>
              No favourite stations yet
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
    backgroundColor: '#0f172a',
  },

  header: {
    padding: 15,
  },

  headerRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  
  starBtn: {
    paddingTop: 2,
  },
  
  card: {
    backgroundColor: '#1f2937',
    borderRadius: 14,
    padding: 16,
    marginBottom: 14,
  },

  innerBox: {
    marginTop: 12,
    backgroundColor: '#111827',
    padding: 14,
    borderRadius: 10,
    borderLeftWidth: 3,
    borderLeftColor: '#22c55e',
  },

  name: {
    flex: 1,
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
    marginRight: 8,
  },

  address: {
    color: '#ffffff',
    marginBottom: 8,
    fontSize: 14,
    fontWeight: 'bold',
  },

  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },

  text: {
    color: '#e5e7eb',
    fontSize: 14,
    fontWeight: 'bold',
  },

  status: {
    color: '#22c55e',
    fontWeight: 'bold',
  },

  distance: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 6,
  },

  emptyContainer: {
    marginTop: 40,
    alignItems: 'center',
  },

  emptyText: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: 'bold',
  },
});