import React, { useState } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, Pressable } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import DateTimePicker from '@react-native-community/datetimepicker';

import { getStations } from '../../services/database/stationService';
import { getChargingFromCloud } from '../../services/api/supabaseService';
import { getCurrentUser } from '../../services/api/authService';

import SearchBar from '../../components/map/SearchBar';

export default function HistoryScreen() {
  const [data, setData] = useState<any[]>([]);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  // 🔍 Search
  const [search, setSearch] = useState('');

  // 📅 Date Filter
  const [showDateFilter, setShowDateFilter] = useState(false);
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);

  const [tempStartDate, setTempStartDate] = useState<Date | null>(null);
  const [tempEndDate, setTempEndDate] = useState<Date | null>(null);

  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);

  useFocusEffect(
    React.useCallback(() => {
      load();
    }, [])
  );

  const load = async () => { //Each time reopen the application, sync history from cloud

    const user = await getCurrentUser();
    
    const cloud = await getChargingFromCloud();
    const stations = await getStations(); 

    const mapped = cloud.map((item: any) => { // map station name and address from local to cloud data
      const station = stations.find(
        (s: any) => Number(s.id) === Number(item.station_id)
      );
        return {
          ...item,
          station_name: station?.name || 'Unknown Station',
          address: station?.address || 'Unknown Address',
        };
      });
      
    const filtered = mapped.filter(
        (item: any) => item.user_id === user?.id
      );

      setData(filtered);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const getStatusLabel = (status: string) => {
    if (status === 'completed') return 'Fully Charged';
    if (status === 'stopped') return 'Partial Charge';
    return status;
  };

  const toggle = (index: number) => {
    setActiveIndex(activeIndex === index ? null : index);
  };

  // ================= FILTER LOGIC =================
  const filteredData = data.filter((item) => {
    const matchSearch =
      !search ||
      (item.station_name || '')
        .toLowerCase()
        .includes(search.toLowerCase());

    const txDate = new Date(item.timestamp);
    txDate.setHours(0, 0, 0, 0);

    let start = startDate ? new Date(startDate) : null;
    let end = endDate ? new Date(endDate) : null;

    if (start) start.setHours(0, 0, 0, 0);
    if (end) end.setHours(0, 0, 0, 0);

    if (start && txDate < start) return false;
    if (end && txDate > end) return false;

    return matchSearch;
  });

  const renderItem = ({ item, index }: any) => {
    const isOpen = activeIndex === index;

    const statusColor =
      item.status === 'completed' ? '#22c55e' : '#f59e0b';

    return (
      <TouchableOpacity
        activeOpacity={0.8}
        style={[styles.card, isOpen && styles.activeCard]}
        onPress={() => toggle(index)}
      >
        {/* HEADER */}
        <View style={styles.row}>
          <View style={{ flex: 1 }}>
            <Text style={styles.station}>
              {item.station_name || 'Unknown Station'}
            </Text>

            <Text style={styles.time}>
              {formatDate(item.timestamp)}
            </Text>
          </View>

          <View style={{ alignItems: 'flex-end' }}>
            <Text style={[styles.status, { color: statusColor }]}>
              {getStatusLabel(item.status)}
            </Text>

            <Icon
              name={isOpen ? 'chevron-up' : 'chevron-down'}
              size={30}
              color={isOpen ? '#22c55e' : '#9ca3af'}
            />
          </View>
        </View>

        {/* EXPAND */}
        {isOpen && (
          <View style={styles.answerBox}>
            <Text style={styles.address}>
              {item.address || 'Unknown Address'}
            </Text>

            <View style={styles.infoRow}>
              <Text style={styles.text}>
                ⚡ {item.energy.toFixed(2)} kWh
              </Text>

              <Text style={styles.cost}>
                RM {item.cost.toFixed(2)}
              </Text>
            </View>

            <Text style={styles.text}>
              Duration: {item.duration || 'Unknown'} mins
            </Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <Pressable
      style={{ flex: 1 }}
      onPress={() => {
        if (showDateFilter) setShowDateFilter(false);
      }}
    >
      <View style={styles.container}>

        {/* ================= HEADER ================= */}
        <View style={styles.header}>
          <View style={{ flex: 1, marginRight: 10 }}>
            <SearchBar
              value={search}
              onChange={setSearch}
              placeholder="Search charging history..."
              showFilter={false}
            />
          </View>

            <TouchableOpacity
              onPress={() => {
                if (!showDateFilter) {
                  setTempStartDate(startDate);
                  setTempEndDate(endDate);
                }
                setShowDateFilter(!showDateFilter);
              }}
              style={styles.calendarBtn}
            >
              <Icon
                name="calendar-month-outline"
                size={30}
                color="#020617"
              />
            </TouchableOpacity>

        </View>

        {/* ================= DATE FILTER ================= */}
        {showDateFilter && (
          <Pressable onPress={(e) => e.stopPropagation()}>
            <View style={styles.datePanel}>

              <TouchableOpacity
                style={styles.dateBtn}
                onPress={() => setShowStartPicker(true)}
              >
                <Text style={styles.dateText}>
                  From: {tempStartDate ? tempStartDate.toDateString() : 'Select'}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.dateBtn}
                onPress={() => setShowEndPicker(true)}
              >
                <Text style={styles.dateText}>
                  To: {tempEndDate ? tempEndDate.toDateString() : 'Select'}
                </Text>
              </TouchableOpacity>

              <View style={styles.dateActions}>
                <TouchableOpacity
                  style={styles.applyBtn}
                  onPress={() => {
                    setStartDate(tempStartDate);
                    setEndDate(tempEndDate);
                    setShowDateFilter(false);
                  }}
                >
                  <Text style={styles.applyText}>Apply</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.clearBtn}
                  onPress={() => {
                    setStartDate(null);
                    setEndDate(null);
                    setShowDateFilter(false);
                  }}
                >
                  <Text style={styles.clearText}>Clear</Text>
                </TouchableOpacity>
              </View>

            </View>
          </Pressable>
        )}

        {/* ================= DATE PICKERS ================= */}
        {showStartPicker && (
          <DateTimePicker
            value={tempStartDate || new Date()}
            mode="date"
            display="default"
            onChange={(event, date) => {
              setShowStartPicker(false);

              if (date) {
                setTempStartDate(date);

                
                if (tempEndDate && date > tempEndDate) {
                  setTempEndDate(date);
                }
              }
            }}
          />
        )}

        {showEndPicker && (
          <DateTimePicker
            value={tempEndDate || new Date()}
            mode="date"
            display="default"
            minimumDate={tempStartDate || undefined} // ✅ prevents invalid selection
            onChange={(event, date) => {
              setShowEndPicker(false);

              if (date) {
                setTempEndDate(date); // ✅ no need for extra validation
              }
            }}
          />
        )}

        {/* ================= LIST ================= */}
        <FlatList
          data={filteredData}
          extraData={activeIndex}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderItem}
          contentContainerStyle={{ padding: 15 }}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>
                No charging history found.
              </Text>
            </View>
          }
        />

      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#020617',
  },

  header: {
    flexDirection: 'row',
    padding: 15,
    alignItems: 'center',
  },

  calendarBtn: {
    padding: 12,
    backgroundColor: '#ffffff',
    borderRadius: 8,
  },

  datePanel: {
    backgroundColor: '#000000',
    padding: 12,
    borderRadius: 10,
    marginBottom: 10,
    elevation: 3,
  },

  dateBtn: {
    backgroundColor: '#f3f4f6',
    padding: 10,
    borderRadius: 8,
    marginBottom: 8,
  },

  dateText: {
    color: '#1f2937', 
    fontWeight: 'bold',
    fontSize: 14,
  },

  dateActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },

  applyBtn: {
    backgroundColor: '#15743c',
    padding: 10,
    borderRadius: 8,
  },

  applyText: {
    color: 'white', 
    fontWeight: 'bold', 
    fontSize: 14,
  },

  clearBtn: {
    backgroundColor: '#ef4444',
    padding: 10,
    borderRadius: 8,
  },

  clearText: {
    color: 'white', 
    fontWeight: 'bold', 
    fontSize: 14,
  },

  card: {
    backgroundColor: '#1f2937',
    borderRadius: 14,
    padding: 16,
    marginBottom: 14,
  },

  activeCard: {
    borderWidth: 1.5,
    borderColor: '#22c55e',
  },

  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  station: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },

  time: {
    color: '#9ca3af',
    fontSize: 14,
    fontWeight: 'bold',
    marginTop: 2,
  },

  status: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },

  answerBox: {
    marginTop: 14,
    backgroundColor: '#111827',
    padding: 14,
    borderRadius: 10,
    borderLeftWidth: 3,
    borderLeftColor: '#22c55e',
  },

  address: {
    color: '#9ca3af',
    marginBottom: 8,
    fontSize: 14,
    fontWeight: 'bold',
  },

  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },

  text: {
    color: '#e5e7eb',
    fontSize: 14,
    fontWeight: 'bold',
  },

  cost: {
    color: '#22c55e',
    fontWeight: 'bold',
    fontSize: 16,
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