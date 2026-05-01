import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { getDistanceKm } from '../../services/api/apiService';

export default function StationCard({
  station,
  connectors = [],
  userLocation,
  showStatus = true,
  acRate = 0.57,
  dcRate = 1.20,
}: any) {

  const distance = userLocation
    ? getDistanceKm(
        userLocation.latitude,
        userLocation.longitude,
        station.latitude,
        station.longitude
      )
    : null;

  // ================= CONNECTORS =================
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

  const isAvailable = station.available_ports > 0;

  const getLocationTags = (station: any) => {
    const name = station.name?.toLowerCase() || '';
    const address = station.address?.toLowerCase() || '';

    const tags = [];

    if (name.includes('mall') || address.includes('mall')) {
        tags.push({ label: 'Mall', color: '#3b82f6' });
    }

    if (name.includes('hotel')) {
        tags.push({ label: 'Hotel', color: '#a855f7' });
    }

    if (name.includes('condo') || name.includes('residential')) {
        tags.push({ label: 'Condo', color: '#f97316' });
    }

    return tags;
    };

  return (
    <View style={styles.innerBox}>

      {/* ADDRESS */}
      <Text style={styles.address}>
        {station.address}
      </Text>

      {/* TAGS */}
      <View style={styles.tagRow}>

        {/* PUBLIC / PRIVATE */}
        {station.name?.toLowerCase().includes('[public]') ? (
            <View style={[styles.tag, { backgroundColor: '#22c55e' }]}>
            <Text style={styles.tagText}>Public</Text>
            </View>
        ) : (
            <View style={[styles.tag, { backgroundColor: '#ef4444' }]}>
            <Text style={styles.tagText}>Private</Text>
            </View>
        )}

        {/* LOCATION TAGS */}
        {getLocationTags(station).map((tag: any, index: number) => (
            <View key={index} style={[styles.tag, { backgroundColor: tag.color }]}>
            <Text style={styles.tagText}>{tag.label}</Text>
            </View>
        ))}

        </View>

      {/* AC */}
      {acTotal > 0 && (
        <View style={styles.infoRow}>
          <Icon name="power-plug" size={20} color="#3b82f6" />

          <View style={styles.infoCenter}>
            <Text style={styles.infoText}>AC • {acPower} kW</Text>
            <Text style={styles.priceText}>RM {acRate.toFixed(2)}/kWh</Text>
          </View>

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
          <Icon name="flash" size={20} color="#f97316" />

          <View style={styles.infoCenter}>
            <Text style={styles.infoText}>DC • {dcPower} kW</Text>
            <Text style={styles.priceText}>RM {dcRate.toFixed(2)}/kWh</Text>
          </View>

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
          📍 ~{distance.toFixed(1)} km away
        </Text>
      )}

      {/* STATUS */}
      {showStatus && (
        <Text style={[
          styles.status,
          { color: isAvailable ? '#22c55e' : '#ef4444' }
        ]}>
          {isAvailable
            ? `${station.available_ports}/${station.total_ports} Available`
            : 'Fully Occupied'}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
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
  },

  tagText: {
    color: 'white',
    fontSize: 11,
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

  infoCenter: {
    flex: 1,
    marginLeft: 8,
  },

  priceText: {
    color: '#22c55e',
    fontSize: 13,
    fontWeight: 'bold',
    position: 'absolute',
    right: 50,
   
  },

  badge: {
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 12,
    bottom: 5,
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