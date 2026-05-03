import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, PermissionsAndroid } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Geolocation from '@react-native-community/geolocation';

import { getStations, getConnectorsByStation } from '../../services/database/stationService';
import { toggleFavourite, getFavourites } from '../../services/storage/favouriteService';
import SearchBar from '../../components/reusable/SearchBar';

import FilterModal from '../../components/reusable/FilterModal';
import StationCard from '../../components/reusable/StationCard';


export default function StationsScreen({ navigation }: any) {
  const [data, setData] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [userLocation, setUserLocation] = useState<any>(null);
  const [connectorsMap, setConnectorsMap] = useState<any>({});
  const [favIds, setFavIds] = useState<number[]>([]);
  const [showFilter, setShowFilter] = useState(false);
  const [filteredData, setFilteredData] = useState<any[]>([]);

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
    setFilteredData(stations);

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
    
    const isFav = favIds.includes(item.id);


    const connectors = connectorsMap[item.id] || [];
    

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
            <Icon
              name={isFav ? 'star' : 'star-outline'}
              size={25}
              color="#facc15"
            />
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

      {/* SEARCH */}
      <View style={styles.header}>
        <SearchBar
          value={search}
          onChange={setSearch}
          onFilterPress={() => setShowFilter(true)}
          placeholder="Search EV stations..."
          showFilter={true}
        />

        <FilterModal
          visible={showFilter}
          onClose={() => setShowFilter(false)}
          onApply={applyFilter}
        />
      </View>


      {/* LIST */}
      <FlatList
        data={filteredData}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderItem}
        contentContainerStyle={{ padding: 15 }}

        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>
                No stations of selected category found.
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
    backgroundColor: '#020617',
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