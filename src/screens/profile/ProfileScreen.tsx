import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Image } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

import { getCurrentUser, logout } from '../../services/api/authService';
import { getProfile, saveProfile } from '../../services/api/profileService';

export default function ProfileScreen( ) {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>({});
  const [editing, setEditing] = useState(false);
  const [phoneError, setPhoneError] = useState('');
  const [plateError, setPlateError] = useState('');
  const [originalProfile, setOriginalProfile] = useState<any>({});

  useEffect(() => {
    load();
  }, []);

  const load = async () => {
    const u = await getCurrentUser();

    if (!u) return; 

    setUser(u);

    const p = await getProfile(u.id);
    if (p) setProfile(p);
    setOriginalProfile(p);
  };

  // ==============================
  // SAVE
  // ==============================
  const handleSave = async () => {

    if (!user?.id) return;

     if (phoneError || plateError || !profile.phone || !profile.car_plate) {
      return;
    }

    await saveProfile({
      id: user.id,
      phone: profile.phone,
      car_plate: profile.car_plate,
    });

    setEditing(false);
  };

  // ==============================
  // CANCEL EDIT
  // ==============================
  const handleCancel = () => {
    setProfile(originalProfile); 
    setEditing(false);
  };

  // ==============================
  // LOGOUT
  // ==============================
  const handleLogout = async () => {
    await logout();
  };

  // ================= VALIDATION =================
  const validatePhone = (value: string) => {
    // remove non-numeric
    const cleaned = value.replace(/[^0-9]/g, '');

    setProfile({ ...profile, phone: cleaned });

    if (!cleaned) {
      setPhoneError('Phone number is required');
    } else if (cleaned.length < 10 || cleaned.length > 11) {
      setPhoneError('Phone must be 10–11 digits');
    } else {
      setPhoneError('');
    }
  };

  const validatePlate = (value: string) => {
    const cleaned = value.toUpperCase().replace(/[^A-Z0-9]/g, '');

    setProfile({ ...profile, car_plate: cleaned });

    if (!cleaned) {
      setPlateError('Car plate is required');
    } else if (cleaned.length < 5) {
      setPlateError('Invalid car plate');
    } else {
      setPlateError('');
    }
  };

  return (
    <View style={styles.container}>

      <View style={styles.content}>

      {/* APP ICON */}
      <View style={styles.appIcon}>
        <Image
          source={require('../../Icon/EZChargeEV_Icon.png')}
          style={styles.logo}
          />
          <Text style={styles.title}>EZChargeEV</Text>
        </View>

      {/* AVATAR */}
        <View style={{ alignItems: 'center', marginBottom: 10 }}>
          <Icon name="account-circle" size={200} color="#22c55e" />
        </View>
      
      <Text style={styles.email}>{user?.email}</Text>

      {/* INFO */}
      <View style={styles.card}>
        {editing ? (
          <>
            <TextInput
              placeholder="Phone"
              placeholderTextColor="#aaa"
              value={profile.phone}
              onChangeText={validatePhone}
              keyboardType="numeric"
              style={[
                styles.input,
                !!phoneError && styles.inputError,
                !phoneError && profile.phone && styles.inputValid,
              ]}
            />

            {phoneError ? (
              <Text style={styles.errorText}>{phoneError}</Text>
            ) : null}

            <TextInput
              placeholder="Car Plate"
              placeholderTextColor="#aaa"
              value={profile.car_plate}
              onChangeText={validatePlate}
              autoCapitalize="characters"
              style={[
                styles.input,
                !!plateError && styles.inputError,
                !plateError && profile.car_plate && styles.inputValid,
              ]}
            />

            {plateError ? (
              <Text style={styles.errorText}>{plateError}</Text>
            ) : null}
          </>
        ) : (
          <>
            <Text style={styles.label}>
              Phone: {profile.phone || ''}
            </Text>
            <Text style={styles.label}>
              Car Plate: {profile.car_plate || ''}
            </Text>
          </>
        )}
      </View>

      {/* BUTTONS */}
      <View style={styles.actions}>
        {editing ? (
          <>
            <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
              <Text style={styles.btnText}>Save</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.cancelBtn} onPress={handleCancel}>
              <Text style={styles.btnText}>Cancel</Text>
            </TouchableOpacity>
          </>
        ) : (
          <TouchableOpacity
            style={styles.editBtn}
            onPress={() => setEditing(true)}
          >
            <Text style={styles.btnText}>Edit</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
          <Text style={styles.btnText}>Logout</Text>
        </TouchableOpacity>
        </View>

      </View>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#020617',
    justifyContent: 'center',
    padding: 20,
  },

  content: {
    alignItems: 'center',
    width: '100%',
  },

  appIcon: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  logo: {
    width: 80,
    height: 80,
    marginRight: 15,
    borderRadius: 20,
    justifyContent: 'center', 
  },

  title: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 30,
  },

  avatar: {
    width: 110,
    height: 110,
    borderRadius: 55,
    marginBottom: 10,
    borderWidth: 2,
    borderColor: '#22c55e',
  },

  email: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
  },

  card: {
    width: '100%',
    backgroundColor: '#1f2937',
    padding: 10,
    borderRadius: 14,
    marginTop: 5,
  },

  label: {
    color: 'white',
    fontSize: 18,
    marginBottom: 5,
    fontWeight: 'bold',
  },

  input: {
    backgroundColor: '#111827',
    color: 'white',
    padding: 12,
    borderRadius: 10,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#374151',
    fontSize: 16,
    fontWeight: 'bold',
  },

  actions: {
    flexDirection: 'row',
    marginTop: 20,
    width: '100%',
    justifyContent: 'space-between',
  },

  editBtn: {
    flex: 1,
    backgroundColor: '#374151',
    padding: 14,
    borderRadius: 10,
    marginRight: 8,
    alignItems: 'center',
  },

  inputError: {
    borderColor: '#ef4444',
  },

  inputValid: {
    borderColor: '#22c55e',
  },

  errorText: {
    color: '#ef4444',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
    marginTop: -6,
  },

  saveBtn: {
    flex: 1,
    backgroundColor: '#15743c',
    padding: 14,
    borderRadius: 10,
    marginRight: 8,
    alignItems: 'center',
  },

  cancelBtn: {
    flex: 1,
    backgroundColor: '#6b7280',
    padding: 14,
    borderRadius: 10,
    marginRight: 8,
    alignItems: 'center',
  },

  logoutBtn: {
    flex: 1,
    backgroundColor: '#ef4444',
    padding: 14,
    borderRadius: 10,
    alignItems: 'center',
  },

  btnText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },

});