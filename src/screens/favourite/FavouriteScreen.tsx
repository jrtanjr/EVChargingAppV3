import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, PermissionsAndroid } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Geolocation from '@react-native-community/geolocation';

import { getStations, getConnectorsByStation } from '../../services/database/stationService';
import { getFavourites, toggleFavourite } from '../../services/storage/favouriteService';
import SearchBar from '../../components/map/SearchBar';
import { getDistanceKm } from '../../services/api/apiService';

import FilterModal from '../../components/map/FilterModal';
import StationCard from '../../components/stations/StationCard';


export default function FavouriteScreen({ navigation }: any) {
  const [data, setData] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [userLocation, setUserLocation] = useState<any>(null);
  const [connectorsMap, setConnectorsMap] = useState<any>({});
  const [showFilter, setShowFilter] = useState(false);
  const [filteredData, setFilteredData] = useState<any[]>([]);

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

    // load connectors info
    const map: any = {};

    for (const station of favStations) {
      const connectors = await getConnectorsByStation(station.id);
      map[station.id] = connectors;
    }

    setConnectorsMap(map);
  };

  const handleToggleFavourite = async (id: number) => {
    await toggleFavourite(id);

    setData((prev) => prev.filter((item) => item.id !== id));
  };

  // ================= FILTER =================
  useEffect(() => {
    if (!search) {
      setFilteredData(data);
      return;
    }

    const result = data.filter((item) =>
      item.name?.toLowerCase().includes(search.toLowerCase())
    );

    setFilteredData(result);
  }, [search, data]);

  const applyFilter = async (filter: any) => {
    if (filter.type === 'ALL') {
      setFilteredData(data);
      setShowFilter(false);
      return;
    }

    const results = await Promise.all(
      data.map(async (station) => {
        const connectors = await getConnectorsByStation(station.id);

        const name = station.name?.toLowerCase() || '';
        const address = station.address?.toLowerCase() || '';

        // TYPE
        const matchType =
          !filter.type ||
          (filter.type === 'AC' &&
            connectors.some(c => c.current_type.includes('AC'))) ||
          (filter.type === 'DC' &&
            connectors.some(c => c.current_type.includes('DC')));

        // ACCESS
        const isPublic = name.includes('[public]');

        const matchAccess =
          !filter.access ||
          (filter.access === 'PUBLIC' && isPublic) ||
          (filter.access === 'PRIVATE' && !isPublic);

        // LOCATION
        const matchLocation =
          !filter.location ||
          (filter.location === 'MALL' &&
            (name.includes('mall') || address.includes('mall'))) ||
          (filter.location === 'HOTEL' && name.includes('hotel')) ||
          (filter.location === 'CONDO' &&
            (name.includes('condo') || name.includes('residential')));

        return matchType && matchAccess && matchLocation
          ? station
          : null;
      })
    );

    setFilteredData(results.filter(Boolean));
    setShowFilter(false);
  };

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

    // ================= CONNECTORS =================
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
            screen: 'MapMain',
            params: { 
              station: item,
              trigger: Date.now(),
             },
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
            <Icon name="star" size={25} color="#facc15" />
          </TouchableOpacity>
        </View>

        <StationCard
          station={item}
          connectors={connectors}
          userLocation={userLocation}
        />
        
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
          onFilterPress={() => setShowFilter(true)}
          placeholder="Search Favourites EV stations..."
          showFilter={true}
        />

        <FilterModal
          visible={showFilter}
          onClose={() => setShowFilter(false)}
          onApply={applyFilter}
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

  tagRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 8,
  },

  tag: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    marginRight: 6,
    marginBottom: 4,
  },

  tagText: {
    color: 'white',
    fontSize: 11,
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