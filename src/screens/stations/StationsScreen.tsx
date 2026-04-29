import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, PermissionsAndroid } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Geolocation from '@react-native-community/geolocation';

import { getStations, getConnectorsByStation } from '../../services/database/stationService';
import { toggleFavourite, getFavourites } from '../../services/storage/favouriteService';
import SearchBar from '../../components/map/SearchBar';
import { getDistanceKm } from '../../services/api/apiService';

export default function StationsScreen({ navigation }: any) {
  const [data, setData] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [userLocation, setUserLocation] = useState<any>(null);
  const [connectorsMap, setConnectorsMap] = useState<any>({});
  const [favIds, setFavIds] = useState<number[]>([]);

  useFocusEffect(
    React.useCallback(() => {
      loadStations();
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

  const loadStations = async () => {
    const stations = await getStations();
    const fav = await getFavourites();

    setData(stations);
    setFavIds(fav);

    // load connectors
    const map: any = {};
    for (const station of stations) {
      const connectors = await getConnectorsByStation(station.id);
      map[station.id] = connectors;
    }

    setConnectorsMap(map);
  };

  const handleToggleFavourite = async (id: number) => {
    await toggleFavourite(id);

    setFavIds((prev) =>
      prev.includes(id)
        ? prev.filter((i) => i !== id)
        : [...prev, id]
    );
  };

  // ================= FILTER =================
  const filteredData = data.filter((item) =>
    item.name?.toLowerCase().includes(search.toLowerCase())
  );

  // ================= RENDER =================
  const renderItem = ({ item }: any) => {
    const isAvailable = item.available_ports > 0;
    const isFav = favIds.includes(item.id);

    const distance = userLocation
      ? getDistanceKm(
          userLocation.latitude,
          userLocation.longitude,
          item.latitude,
          item.longitude
        )
      : null;

    const connectors = connectorsMap[item.id] || [];

    const ac = connectors.filter((c: any) =>
      c.current_type?.toUpperCase().includes('AC')
    );

    const dc = connectors.filter((c: any) =>
      c.current_type?.toUpperCase().includes('DC')
    );

    const acTotal = ac.reduce((sum: number, c: any) => sum + c.quantity, 0);
    const acAvailable = ac.reduce((sum: number, c: any) => sum + c.available, 0);
    const acPower = ac.length > 0 ? Math.max(...ac.map((c: any) => c.power_kw || 0)) : 0;

    const dcTotal = dc.reduce((sum: number, c: any) => sum + c.quantity, 0);
    const dcAvailable = dc.reduce((sum: number, c: any) => sum + c.available, 0);
    const dcPower = dc.length > 0 ? Math.max(...dc.map((c: any) => c.power_kw || 0)) : 0;

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
            <Icon
              name={isFav ? 'star' : 'star-outline'}
              size={25}
              color="#facc15"
            />
          </TouchableOpacity>
        </View>

        {/* INNER BOX */}
        <View style={styles.innerBox}>
          <Text style={styles.address}>
            {item.address}
          </Text>

          {/* AC */}
          {acTotal > 0 && (
            <View style={styles.infoRow}>
              <Icon name="power-plug" size={18} color="#3b82f6" />
              <Text style={styles.infoText}>
                AC • {acPower} kW
              </Text>
              <View style={[styles.badge, { backgroundColor: '#3b82f6' }]}>
                <Text style={styles.badgeText}>
                  {acAvailable}/{acTotal}
                </Text>
              </View>
            </View>
          )}

          {/* DC */}
          {dcTotal > 0 && (
            <View style={styles.infoRow}>
              <Icon name="flash" size={18} color="#f97316" />
              <Text style={styles.infoText}>
                DC • {dcPower} kW
              </Text>
              <View style={[styles.badge, { backgroundColor: '#f97316' }]}>
                <Text style={styles.badgeText}>
                  {dcAvailable}/{dcTotal}
                </Text>
              </View>
            </View>
          )}

          {/* DISTANCE */}
          {distance && (
            <Text style={styles.distance}>
              📍 {distance.toFixed(1)} km away
            </Text>
          )}

          {/* STATUS */}
          <Text
            style={[
              styles.status,
              { color: isAvailable ? '#22c55e' : '#ef4444' },
            ]}
          >
            {isAvailable
              ? `${item.available_ports}/${item.total_ports} Available`
              : 'Fully Occupied'}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>

      {/* SEARCH */}
      <View style={styles.header}>
        <SearchBar
          value={search}
          onChange={setSearch}
          placeholder="Search EV stations..."
          showFilter={false}
        />
      </View>

      {/* LIST */}
      <FlatList
        data={filteredData}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderItem}
        contentContainerStyle={{ padding: 15 }}
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

  card: {
    backgroundColor: '#1f2937',
    borderRadius: 14,
    padding: 16,
    marginBottom: 14,
  },

  headerRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },

  name: {
    flex: 1,
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
    marginRight: 8,
  },

  starBtn: {
    paddingTop: 2,
  },

  innerBox: {
    marginTop: 12,
    backgroundColor: '#111827',
    padding: 14,
    borderRadius: 10,
    borderLeftWidth: 3,
    borderLeftColor: '#22c55e',
  },

  address: {
    color: '#ffffff',
    marginBottom: 8,
    fontWeight: 'bold',
  },

  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },

  infoText: {
    flex: 1,
    marginLeft: 8,
    color: '#e5e7eb',
    fontWeight: 'bold',
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

  distance: {
    color: '#ffffff',
    fontWeight: 'bold',
    marginBottom: 6,
  },

  status: {
    fontWeight: 'bold',
  },
});