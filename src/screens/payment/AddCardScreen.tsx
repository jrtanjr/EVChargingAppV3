import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { saveCard } from '../../services/storage/cardService';

export default function AddCardScreen({ navigation }: any) {
  const [number, setNumber] = useState('');
  const [name, setName] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');

  // ==============================
  // CARD TYPE DETECTION
  // ==============================
  const getCardType = (num: string) => {
    const cleaned = num.replace(/\s/g, '');

    if (cleaned.startsWith('4')) return 'visa';
    if (/^5[1-5]/.test(cleaned)) return 'mastercard';

    return 'Credit/Debit Card';
  };

  const cardType = getCardType(number);

  // ==============================
  // INPUT HANDLERS
  // ==============================
  const handleCardNumber = (text: string) => {
    let cleaned = text.replace(/\D/g, '').slice(0, 16);
    let formatted = cleaned.replace(/(.{4})/g, '$1 ').trim();
    setNumber(formatted);
  };

  const handleName = (text: string) => {
    let cleaned = text.replace(/[^a-zA-Z\s]/g, '');
    setName(cleaned);
  };

  const handleExpiry = (text: string) => {
    let cleaned = text.replace(/\D/g, '').slice(0, 4);

    let month = cleaned.slice(0, 2);
    let year = cleaned.slice(2);

    if (month.length === 2) {
      let m = parseInt(month, 10);
      if (m < 1) month = '01';
      if (m > 12) month = '12';
    }

    const formatted =
      cleaned.length >= 3 ? `${month}/${year}` : month;

    setExpiry(formatted);
  };

  const handleCvv = (text: string) => {
    let cleaned = text.replace(/\D/g, '').slice(0, 3);
    setCvv(cleaned);
  };

  // ==============================
  // SAVE
  // ==============================
  const handleSave = async () => {
    const rawNumber = number.replace(/\s/g, '');

    if (
      rawNumber.length !== 16 ||
      name.length === 0 ||
      expiry.length !== 5 ||
      cvv.length !== 3
    ) {
      return;
    }

    const last4 = rawNumber.slice(-4);

    await saveCard({
      number: rawNumber,
      name,
      expiry,
      last4,
    });

    navigation.goBack();
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>💳 Add Card</Text>

      {/* ================= CARD PREVIEW ================= */}
      <View style={styles.cardPreview}>
        <View style={styles.cardHeader}>


            <View style={styles.cardBrand}>
                {cardType === 'visa' && (
                <Text style={[styles.brandText, { color: '#3b82f6' }]}>
                    VISA
                </Text>
                )}

                {cardType === 'mastercard' && (
                <Text style={[styles.brandText, { color: '#f97316' }]}>
                    MASTERCARD
                </Text>
                )}

                {cardType === 'Credit/Debit Card' && (
                <Text style={[styles.brandText, { color: '#9ca3af' }]}>
                    CARD
                </Text>
                )}
            </View>

        </View>

        <Text style={styles.cardNumber}>
          {number || '#### #### #### ####'}
        </Text>

        <View style={styles.cardRow}>
          <Text style={styles.cardName}>
            {name || 'CARD HOLDER'}
          </Text>

          <Text style={styles.cardExpiry}>
            {expiry || 'MM/YY'}
          </Text>
        </View>
      </View>

      {/* ================= INPUT FORM ================= */}
      <View style={styles.formBox}>

        <Text style={styles.label}>Card Number</Text>
        <TextInput 
          placeholder="1234 5678 9012 3456"
          placeholderTextColor="#9ca3af"
          keyboardType="numeric"
          value={number}
          onChangeText={handleCardNumber}
          style={styles.input}
        />

        <Text style={styles.label}>Card Holder</Text>
        <TextInput
          placeholder="Example: JR TAN.."
          placeholderTextColor="#9ca3af"
          value={name}
          onChangeText={handleName}
          style={styles.input}
        />

        <View style={styles.row}>
          <View style={{ flex: 1 }}>
            <Text style={styles.label}>Expiry</Text>
            <TextInput
              placeholder="MM/YY"
              placeholderTextColor="#9ca3af"
              keyboardType="numeric"
              value={expiry}
              onChangeText={handleExpiry}
              style={styles.input}
            />
          </View>

          <View style={{ flex: 1, marginLeft: 10 }}>
            <Text style={styles.label}>CVV</Text>
            <TextInput
              placeholder="123"
              placeholderTextColor="#9ca3af"
              keyboardType="numeric"
              secureTextEntry
              value={cvv}
              onChangeText={handleCvv}
              style={styles.input}
            />
          </View>
        </View>

      </View>

      {/* ================= BUTTON ================= */}
      <TouchableOpacity style={styles.btn} onPress={handleSave}>
        <Text style={styles.btnText}>Save Card</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a',
    padding: 20,
  },

  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 20,
  },

  // ================= CARD PREVIEW =================
  cardPreview: {
    backgroundColor: '#1f2937',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
  },

  cardType: {
    color: '#9ca3af',
    fontSize: 15,
    marginBottom: 10,
  },

  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },

  chip: {
    width: 40,
    height: 28,
    backgroundColor: '#a8a625',
    borderRadius: 6,
  },

  cardBrand: {
    justifyContent: 'center',
    alignItems: 'flex-end',
  },

  brandText: {
    fontSize: 20,
    fontWeight: 'bold',
    letterSpacing: 1,
  },

  cardNumber: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
    letterSpacing: 4,
    marginBottom: 15,
  },

  cardRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },

  cardName: {
    color: 'white',
    fontSize: 15,
    fontWeight: 'bold'
  },

  cardExpiry: {
    color: 'white',
    fontSize: 15,
    fontWeight: 'bold'
  },

  // ================= FORM =================
  formBox: {
    backgroundColor: '#1f2937',
    padding: 15,
    borderRadius: 15,
    marginBottom: 20,
  },

  label: {
    color: '#9ca3af',
    fontSize: 16,
    marginBottom: 5,
  },

  input: {
    backgroundColor: '#111827',
    color: 'white',
    borderRadius: 10,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#374151',
    fontSize: 16,
  },

  row: {
    flexDirection: 'row',
  },

  // ================= BUTTON =================
  btn: {
    backgroundColor: '#22c55e',
    padding: 14,
    borderRadius: 12,
    alignItems: 'center',
  },

  btnText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
});