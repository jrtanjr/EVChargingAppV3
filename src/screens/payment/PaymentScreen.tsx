import React, { useState } from 'react';
import { View, Text, TouchableOpacity, FlatList, StyleSheet, Pressable } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import DateTimePicker from '@react-native-community/datetimepicker';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

import { getBalance, topUp } from '../../services/storage/walletService';
import { getPayments, insertPayment } from '../../services/database/paymentService';

export default function PaymentScreen() {

  //State
  const [balance, setBalance] = useState(0);
  const [payments, setPayments] = useState<any[]>([]);
  const [filter, setFilter] = useState<'all' | 'charging' | 'topup'>('all');
  
  const [showDateFilter, setShowDateFilter] = useState(false);

  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);

  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);

  const [tempStartDate, setTempStartDate] = useState<Date | null>(null);
  const [tempEndDate, setTempEndDate] = useState<Date | null>(null);

  const [showTopUpOptions, setShowTopUpOptions] = useState(false);
  

  useFocusEffect(
    React.useCallback(() => {
      load();
    }, [])
  );

  const load = async () => {
    const b = await getBalance();
    const p = await getPayments();

    setBalance(b);
    setPayments(p);
  };

  // ==============================
  // TOP UP FUNCTION
  // ==============================
  const handleTopUp = async (amount: number) => {
    const newBalance = await topUp(amount);

    // Save transaction
    await insertPayment({
      amount,
      method: 'topup',
      status: 'success',
    });

    setBalance(newBalance);

    // reload history
    const p = await getPayments();
    setPayments(p);

    setShowTopUpOptions(false);
  };

  // ==============================
  // FILTER LOGIC
  // ==============================
  const filteredPayments = payments.filter((p) => {
    
    if (filter === 'charging') {
      if (!(p.method === 'wallet' || p.method === 'card')) return false;
    }

    if (filter === 'topup') {
      if (p.method !== 'topup') return false;
    }

    //Date filter
    const txDate = new Date(p.timestamp);

    if (startDate && txDate < startDate) return false;
    if (endDate && txDate > endDate) return false;

    return true;
  });

  const formatDate = (date: string) =>
    new Date(date).toLocaleString();

  // ==============================
  // RENDER ITEM
  // ==============================
  const renderItem = ({ item }: any) => {
  const isTopUp = item.method === 'topup';

  return (
    <View style={styles.txCard}>

      {/* HEADER ROW */}
        <View style={styles.txRow}>
          <Text style={styles.txMethod}>
            {isTopUp ? 'Balance Top Up' : 'Charging Payment'}
          </Text>

          <Text
            style={[
              styles.txAmount,
              { color: isTopUp ? '#22c55e' : '#ef4444' },
            ]}
          >
            {isTopUp ? '+' : '-'} RM {item.amount.toFixed(2)}
          </Text>
        </View>

        {/* SUB INFO */}
        <Text style={styles.txSub}>
          Method: {item.method.toUpperCase()}
        </Text>

        <Text style={styles.txDate}>
          {formatDate(item.timestamp)}
        </Text>

      </View>
    );
  };

  return (
    <Pressable
      style={{ flex: 1 }}
      onPress={() => {
        if (showDateFilter) setShowDateFilter(false);
        if (showTopUpOptions) setShowTopUpOptions(false);
      }}
    >

    <View style={styles.container}>

      {/* ================= WALLET CARD ================= */}
      <View style={styles.card}>
        <Text style={styles.label}>Wallet Balance</Text>

        <Text
          style={[
            styles.balance,
            { color: balance < 0 ? '#ef4444' : '#22c55e' },
          ]}
        >
          RM {balance.toFixed(2)}
        </Text>

        {balance < 0 && (
          <Text style={styles.warning}>
            Your wallet is negative. Please top up.
          </Text>
        )}

        {/* TOP UP BUTTONS */}
        {!showTopUpOptions ? (
          // 🔘 MAIN BUTTON
          <TouchableOpacity
            style={styles.topUpMainBtn}
            onPress={() => setShowTopUpOptions(true)}
          >
            <Text style={styles.topUpMainText}>Top Up</Text>
          </TouchableOpacity>
        ) : (
          // 💰 OPTIONS
          <>
            <View style={styles.topUpRow}>
              {[10, 20, 50].map((amt) => (
                <TouchableOpacity
                  key={amt}
                  style={styles.topUpBtn}
                  onPress={() => handleTopUp(amt)}
                >
                  <Text style={styles.topUpText}>+RM {amt}</Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* CANCEL BUTTON*/}
            <TouchableOpacity
              onPress={() => setShowTopUpOptions(false)}
              style={styles.cancelBtn}
            >
              <Text style={styles.cancelText}>
                Cancel
              </Text>
            </TouchableOpacity>
          </>
        )}
      </View>

      {/* ================= FILTER HEADER ================= */}
      <View style={styles.filterHeader}>

        {/* FILTER BUTTONS */}
        <View style={styles.filterRow}>
          {['all', 'charging', 'topup'].map((f) => (
            <TouchableOpacity
              key={f}
              onPress={() => setFilter(f as any)}
              style={[
                styles.filterBtn,
                filter === f && styles.activeFilter,
              ]}
            >
              <Text
                style={{
                  color: filter === f ? 'white' : '#ffffff',
                  fontWeight: 'bold',
                  fontSize: 14,
                }}
              >
                {f.toUpperCase()}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* CALENDAR ICON */}
        <TouchableOpacity
          onPress={() => {
            if (!showDateFilter) {
              setTempStartDate(startDate);
              setTempEndDate(endDate);
            }

            setShowDateFilter(!showDateFilter)
          }}
          style={styles.calendarBtn}
        >
          <Icon name="calendar-month-outline" size={22} color="#ffffff" />
        </TouchableOpacity>

      </View>
      
      {/* ================= DATE FILTER PANEL ================= */}
        {showDateFilter && (
          <Pressable onPress={(e) => e.stopPropagation()}>
            <View style={styles.datePanel}>

              <TouchableOpacity
                style={styles.dateBtn}
                onPress={() => setShowStartPicker(true)}
              >
                <Text style={{ color: '#222222', fontWeight: 'bold', fontSize: 14 }}>
                  From: {tempStartDate ? tempStartDate.toDateString() : ' Select Start Date'}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.dateBtn}
                onPress={() => setShowEndPicker(true)}
              >
                <Text style={{ color: '#222222', fontWeight: 'bold', fontSize: 14 }}>
                  To: {tempEndDate ? tempEndDate.toDateString() : ' Select End Date'}
                </Text>
              </TouchableOpacity>

              <View style={styles.dateActions}>
                <TouchableOpacity
                  style={styles.applyBtn}
                  onPress={() => {
                    setStartDate(tempStartDate);
                    setEndDate(tempEndDate);
                    setShowDateFilter(false)
                  }}
                >
                  <Text style={{ color: 'white', fontWeight: 'bold', fontSize: 14 }}>Apply</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.clearBtn}
                  onPress={() => {
                    setStartDate(null);
                    setEndDate(null);
                    setShowDateFilter(false);

                  }}
                >
                  <Text style={{ color: 'white', fontWeight: 'bold', fontSize: 14 }}>Clear</Text>
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

                //adjust end date if earlier than start date (invalid)
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
            onChange={(event, date) => {
              setShowEndPicker(false);

              if (date) {
                if (tempStartDate && date < tempStartDate) { //adjust end date if earlier than start date (invalid)
                    setTempEndDate(tempStartDate);
                  } else {
                  setTempEndDate(date);
                }
              }
            }}
          />
        )}

      {/* ================= TRANSACTION LIST ================= */}
      <FlatList
        data={filteredPayments}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderItem}
        contentContainerStyle={{ paddingBottom: 50 }}
        ListEmptyComponent={
          <Text style={{ textAlign: 'center', marginTop: 20 }}>
            No transactions yet
          </Text>
        }
      />
    </View>

    
  </Pressable>
  );
}

// ==============================
// STYLES
// ==============================
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f7fa',
    padding: 15,
  },

  card: {
    backgroundColor: '#222222',
    padding: 20,
    borderRadius: 12,
    marginBottom: 20,
  },

  label: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 20,
  },

  balance: {
    fontSize: 28,
    fontWeight: 'bold',
    marginVertical: 10,
  },

  warning: {
    color: '#ef4444',
    marginBottom: 10,
  },

  topUpMainBtn: {
    backgroundColor: '#2563eb',
    padding: 10,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 10,
    marginBottom: -10,
  },

  topUpMainText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },

  topUpRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },

  topUpBtn: {
    backgroundColor: '#22c55e',
    padding: 10,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: 'gray',
  },

  topUpText: {
    color: 'white',
    fontWeight: 'bold',
  },

  cancelBtn: {
    alignSelf: 'center', 
    backgroundColor: '#c52222',
    paddingHorizontal: 50,
    paddingVertical: 10,
    borderRadius: 8,
    marginTop: 10,
    marginBottom: -10,
  },

  cancelText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'center',
  },

  filterHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },

  filterRow: {
    flexDirection: 'row',
    marginBottom: 10,
  },

  filterBtn: {
    padding: 8,
    marginRight: 10,
    backgroundColor: '#222222',
    borderRadius: 6,
  },

  activeFilter: {
    backgroundColor: '#22c55e',
  },

  calendarBtn: {
    padding: 6,
    backgroundColor: '#222222',
    borderRadius: 8,
  },

  datePanel: {
    backgroundColor: '#222222',
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

  dateActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },

  applyBtn: {
    backgroundColor: '#22c55e',
    padding: 10,
    borderRadius: 8,
  },

  clearBtn: {
    backgroundColor: '#ef4444',
    padding: 10,
    borderRadius: 8,
  },

  txCard: {
    backgroundColor: '#222222',
    padding: 15,
    borderRadius: 12,
    marginBottom: 12,
    elevation: 20,
  },

  txRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },

  txAmount: {
    fontWeight: 'bold',
    fontSize: 16,
  },

  txMethod: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 14,
  },

  txSub: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  
  txDate: {
    fontSize: 12,
    color: '#c4cbd6',
  },

});