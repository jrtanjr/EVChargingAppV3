import React, { useEffect, useRef, useState, useMemo } from 'react';
import { View, StyleSheet, Text, Keyboard, TextInput, PermissionsAndroid, FlatList, TouchableOpacity } from 'react-native';
import MapView, { Marker, Region } from 'react-native-maps';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Geolocation from '@react-native-community/geolocation';
import { useRoute } from '@react-navigation/native';

import TopBar from '../../components/reusable/TopBar';
import StationPopup from '../../components/stations/StationPopup';
import FilterModal from '../../components/reusable/FilterModal';
import SearchBar from '../../components/reusable/SearchBar';

import { fetchStationsFromAPI, transformStations, getDistanceKm } from '../../services/api/apiService';
import { insertStationsWithConnectors, getStations, getConnectorsByStation } from '../../services/database/stationService';

declare global {
  interface Navigator {
    geolocation: any;
  }
}

type Station = {
  id: number;
  latitude: number;
  longitude: number;
  available_ports: number;
  name?: string;
  address?: string;
};

const DEFAULT_REGION: Region = {
  latitude: 3.139,
  longitude: 101.6869,
  latitudeDelta: 0.5,
  longitudeDelta: 0.5,
};



export default function MapScreen({ navigation }: any) {
  const [stations, setStations] = useState<Station[]>([]);
  const [filteredStations, setFilteredStations] = useState<Station[]>([]);
  const [selectedStation, setSelectedStation] = useState<Station | null>(null);

  const [search, setSearch] = useState('');
  const [showFilter, setShowFilter] = useState(false);

  const [suggestions, setSuggestions] = useState<Station[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const [region, setRegion] = useState<Region>(DEFAULT_REGION);

  const inputRef = useRef<TextInput>(null);
  const mapRef = useRef<MapView | null>(null);
  const [userLocation, setUserLocation] = useState<any>(null);

  const [nearbyStations, setNearbyStations] = useState<any[]>([]);
  const [showNearby, setShowNearby] = useState(true);

  const route = useRoute<any>();


  useEffect(() => {
    init();
    getUserLocation();
  }, []);

  useEffect(() => { 
    if (route.params?.station) {
      const station = route.params.station;

      setSelectedStation(station);

      // focus map
      mapRef.current?.animateToRegion(
        {
          latitude: station.latitude,
          longitude: station.longitude,
          latitudeDelta: 0.02,
          longitudeDelta: 0.02,
        },
        500
      );

    }
  }, [route.params?.trigger]);

  useEffect(() => { //sort nearby stations
    if (!userLocation || stations.length === 0) return;

    const sorted = stations
      .map((s) => {
        const distance = getDistanceKm(
          userLocation.latitude,
          userLocation.longitude,
          s.latitude,
          s.longitude
        );

        return {
          ...s,
          distance,
        };
      })
      .sort((a, b) => a.distance - b.distance)
      .slice(0, 5);

    setNearbyStations(sorted);
  }, [userLocation, stations]);

  useEffect(() => {
    if (selectedStation) {
      setShowNearby(false); //    hide when popup opens
    }
  }, [selectedStation]);

  const init = async () => {
    try {
      const existing = await getStations();

      if (existing.length > 0) {
        setStations(existing);
        setFilteredStations(existing);
        return;
      }

      const apiData = await fetchStationsFromAPI();
      const cleanData = transformStations(apiData);

      await insertStationsWithConnectors(cleanData);

      const data = await getStations();
      setStations(data);
      setFilteredStations(data);
    } catch (error) {
      console.log('LOAD ERROR:', error);
    }
  };

  // ==============================
  // GET USER LOCATION
  // ==============================
  const getUserLocation = async () => {
    const granted = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
    );

    if (granted !== PermissionsAndroid.RESULTS.GRANTED) return;

    Geolocation.getCurrentPosition(
      (position) => {
        const coords = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        };

        setUserLocation(coords);
      },
      (error) => console.log(error.message),
      {
        enableHighAccuracy: true,
        timeout: 20000,
        maximumAge: 1000,
      }
    );
  };

  // ==============================
  // SEARCH
  // ==============================
  useEffect(() => {
    const trimmed = search.trim().toLowerCase();

    if (!trimmed) {
      setFilteredStations(stations);
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    const result = stations.filter((s) =>
      (s.name?.toLowerCase() || '').includes(trimmed) ||
      (s.address?.toLowerCase() || '').includes(trimmed)
    );

    setFilteredStations(result);
    setSuggestions(result.slice(0, 5));
    setShowSuggestions(true);
  }, [search, stations]);

  // ==============================
  // RESET HELPERS
  // ==============================
  const clearSearchUI = () => {
    setSearch('');
    setSuggestions([]);
    setShowSuggestions(false);
  };

  const resetFilters = () => {
    setFilteredStations(stations);
  };

  const resetUI = () => {
    clearSearchUI();
    resetFilters();
    setSelectedStation(null);
  };

  // ==============================
  // FOCUS
  // ==============================
  const focusOnStation = (station: Station) => {
    if (station.latitude == null || station.longitude == null) return;

    mapRef.current?.animateToRegion(
      {
        latitude: station.latitude,
        longitude: station.longitude,
        latitudeDelta: 0.02,
        longitudeDelta: 0.02,
      },
      500
    );

    setSelectedStation(station);
  };

  // ==============================
  // FILTER
  // ==============================
  const applyFilter = async (filter: any) => {
    try {
      if (filter.type === 'ALL') {
        resetUI();
        setShowFilter(false);

        mapRef.current?.animateToRegion(DEFAULT_REGION, 500);
        setRegion(DEFAULT_REGION);
        return;
      }

      const results = await Promise.all(
        stations.map(async (station) => {
          const connectors = await getConnectorsByStation(station.id);

          const matchAC =
            filter.type === 'AC' &&
            connectors.some(c => c.current_type.includes('AC'));

          const matchDC =
            filter.type === 'DC' &&
            connectors.some(c => c.current_type.includes('DC'));

          return matchAC || matchDC ? station : null;
        })
      );

      let result = results.filter(Boolean) as Station[];

      if (search) {
        result = result.filter((s) =>
          (s.name?.toLowerCase() || '').includes(search.toLowerCase())
        );
      }

      setFilteredStations(result);
      setShowFilter(false);

      mapRef.current?.animateToRegion(DEFAULT_REGION, 500); // reset view to show all results
      setRegion(DEFAULT_REGION);

    } catch (error) {
      console.log('FILTER ERROR:', error);
    }
  };

  // ==============================
  // CLUSTER LOGIC
  // ==============================
  const clusters = useMemo(() => {
    const threshold = region.latitudeDelta / 10;
    const result: Station[][] = [];
    const visited = new Set<number>();

    filteredStations.forEach((s, i) => {
      if (visited.has(i)) return;

      const group = [s];
      visited.add(i);

      filteredStations.forEach((other, j) => {
        if (i !== j && !visited.has(j)) {
          const distance =
            Math.abs(s.latitude - other.latitude) +
            Math.abs(s.longitude - other.longitude);

          if (distance < threshold) {
            group.push(other);
            visited.add(j);
          }
        }
      });

      result.push(group);
    });

    return result;
  }, [filteredStations, region]);

  return (
    <View style={styles.container}>

      <View style={styles.topBarContainer}>
        <TopBar navigation={navigation} />
      </View>

      <View style={styles.searchWrapper}>
        <SearchBar
          value={search}
          onChange={setSearch}
          onFilterPress={() => setShowFilter(true)}
        />

        {showSuggestions && suggestions.length > 0 && (
          <View style={styles.suggestionBox}>
            {suggestions.map((item) => (
              <Text
                key={item.id}
                style={styles.suggestionItem}
                onPress={() => {
                  setSearch(item.name || '');
                  setShowSuggestions(false);
                  focusOnStation(item);
                }}
              >
                {item.name}
              </Text>
            ))}
          </View>
        )}
      </View>

      <MapView
        ref={mapRef}
        style={styles.map}
        initialRegion={DEFAULT_REGION}
        onRegionChangeComplete={(r) => setRegion(r)}
        onPress={() => {
          resetUI();
          Keyboard.dismiss();
          inputRef.current?.blur();
        }}
      >
        {clusters.map((group, index) => {
          const first = group[0];

          if (group.length === 1) {
            return (
              <Marker
                key={first.id}
                coordinate={{
                  latitude: first.latitude,
                  longitude: first.longitude,
                }}
                onPress={() => focusOnStation(first)}
                tracksViewChanges={false}
              >
                <Icon
                  name="ev-station"
                  size={30}
                  color={first.available_ports > 0 ? 'green' : 'red'}
                />
              </Marker>
            );
          }

          const hasAvailable = group.some(s => s.available_ports > 0);

          const avgLat =
            group.reduce((sum, s) => sum + s.latitude, 0) / group.length;

          const avgLng =
            group.reduce((sum, s) => sum + s.longitude, 0) / group.length;

          return (
            <Marker
              key={`cluster-${index}`}
              coordinate={{ latitude: avgLat, longitude: avgLng }}
              tracksViewChanges={false}
              onPress={() => {
                mapRef.current?.animateToRegion({
                  latitude: avgLat,
                  longitude: avgLng,
                  latitudeDelta: Math.max(region.latitudeDelta / 2, 0.02),
                  longitudeDelta: Math.max(region.longitudeDelta / 2, 0.02),
                });
              }}
            >
              <View style={styles.clusterOuter}>
                <View
                  style={[
                    styles.clusterInner,
                    {
                      backgroundColor: hasAvailable ? '#15743c' : '#e74c3c',
                    },
                  ]}
                >
                  <Icon name="ev-station" size={20} color="white" />
                  <Text style={styles.clusterText}>{group.length}</Text>
                </View>
              </View>
            </Marker>
          );
        })}
      </MapView>
      
      <TouchableOpacity
        style={styles.toggleNearbyBtn}
        onPress={() => setShowNearby(prev => !prev)}
      >
        <Text style={styles.toggleText}>
          {showNearby ? 'Hide Nearby' : 'Show Nearby'}
        </Text>
      </TouchableOpacity>

      {showNearby && !selectedStation && (
      <View style={styles.nearbyContainer}>
        <Text style={styles.nearbyTitle}>Nearby Stations</Text>

        <FlatList
          data={nearbyStations}
          horizontal
          showsHorizontalScrollIndicator={false}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
          
            <TouchableOpacity
              style={styles.nearbyCard}
              onPress={() => focusOnStation(item)}
            >
              <Text style={styles.nearbyName}>
                {item.name || 'Station'}
              </Text>

              <Text style={styles.nearbyDistance}>
                {item.distance.toFixed(2)} km
              </Text>

              <Text
                style={[
                  styles.nearbyStatus,
                  {
                    color:
                      item.available_ports > 0
                        ? '#22c55e'
                        : '#ef4444',
                  },
                ]}
              >
                {item.available_ports > 0
                  ? 'Available'
                  : 'Full'}
              </Text>
            </TouchableOpacity>
          )}
        />
      </View>
      )}

      {selectedStation && (
        <StationPopup
          station={selectedStation}
          userLocation={userLocation}
          onClose={resetUI}
          onRefresh={init}
          navigation={navigation}
        />
      )}

      <FilterModal
        visible={showFilter}
        onClose={() => setShowFilter(false)}
        onApply={applyFilter}
      />

    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },

  topBarContainer: {
    position: 'absolute', 
    top: 0,
    left: 0,
    right: 0,
    zIndex: 100,
    backgroundColor: '#020617',
  },

  searchWrapper: {
    position: 'absolute',
    top: 75,
    left: 15,
    right: 15,
    zIndex: 20,
  },

  map: { flex: 1 },

  suggestionBox: {
    backgroundColor: 'white',
    marginTop: 2,
    borderRadius: 16,
    elevation: 10,
  },

  suggestionItem: {
    padding: 10,
    borderBottomWidth: 2,
    borderBottomColor: '#ccc2c2',
  },

  clusterOuter: {
    backgroundColor: 'rgba(21, 116, 60, 0.25)', // consistent dark green glow
    borderRadius: 30,
    padding: 6,
  },

  clusterInner: {
    borderRadius: 25,
    width: 50,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 6,
  },

  clusterText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 12,
  },

  toggleNearbyBtn: {
    position: 'absolute',
    bottom: 15,
    alignSelf: 'center',
    backgroundColor: '#1f2937',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    zIndex: 20,
  },

  toggleText: {
    color: 'white',
    fontWeight: 'bold',
  },

  nearbyContainer: {
    position: 'absolute',
    bottom: 90,
    width: '100%',
  },

  nearbyTitle: {
    fontSize:20,
    color: 'black',
    fontWeight: 'bold',
    marginLeft: 15,
    marginBottom: 6,
  },

  nearbyCard: {
    backgroundColor: '#1f2937',
    padding: 10,
    borderRadius: 10,
    marginHorizontal: 5,
    width: 180,
  },

  nearbyName: {
    color: 'white',
    fontWeight: 'bold',
  },

  nearbyDistance: {
    color: '#9ca3af',
    marginTop: 4,
  },

  nearbyStatus: {
    marginTop: 6,
    fontWeight: 'bold',
  },
});