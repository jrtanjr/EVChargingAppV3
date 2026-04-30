import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

import { getCurrentUser, logout } from '../../services/api/authService';
import { supabase } from '../../services/api/supabaseClient';

export default function ProfileScreen({ navigation }: any) {
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    const u = await getCurrentUser();
    setUser(u);
  };

  const handleLogout = async () => {
     await supabase.auth.signOut();
  };

  return (
    <View style={styles.container}>

      {/* PROFILE CARD */}
      <View style={styles.card}>

        <Icon name="account-circle" size={90} color="#22c55e" />

        <Text style={styles.name}>
          {user?.email?.split('@')[0] || 'User'}
        </Text>

        <Text style={styles.email}>
          {user?.email}
        </Text>

      </View>

      {/* INFO CARD */}
      <View style={styles.infoCard}>
        <Text style={styles.label}>Phone: -</Text>
        <Text style={styles.label}>Car Plate: -</Text>
      </View>

      {/* ACTIONS */}
      <View style={styles.actions}>

        <TouchableOpacity style={styles.editBtn}>
          <Text style={styles.btnText}>Edit</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
          <Text style={styles.btnText}>Logout</Text>
        </TouchableOpacity>

      </View>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a',
    padding: 20,
  },

  card: {
    alignItems: 'center',
    backgroundColor: '#1f2937',
    padding: 20,
    borderRadius: 14,
    marginBottom: 20,
  },

  name: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 10,
  },

  email: {
    color: '#9ca3af',
  },

  infoCard: {
    backgroundColor: '#1f2937',
    padding: 15,
    borderRadius: 12,
  },

  label: {
    color: 'white',
    marginBottom: 8,
  },

  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },

  editBtn: {
    backgroundColor: '#374151',
    padding: 12,
    borderRadius: 8,
    flex: 1,
    marginRight: 10,
    alignItems: 'center',
  },

  logoutBtn: {
    backgroundColor: '#ef4444',
    padding: 12,
    borderRadius: 8,
    flex: 1,
    alignItems: 'center',
  },

  btnText: {
    color: 'white',
    fontWeight: 'bold',
  },
});