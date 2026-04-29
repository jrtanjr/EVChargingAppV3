import React, { useState, useRef } from 'react';
import { View, Text, TouchableOpacity, FlatList, StyleSheet, Pressable, Animated, Alert } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import DateTimePicker from '@react-native-community/datetimepicker';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

import { getBalance, topUp } from '../../services/storage/walletService';
import { getPayments, insertPayment } from '../../services/database/paymentService';
import { getCard, removeCard } from '../../services/storage/cardService';

export default function PaymentScreen({ navigation }: any) {

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
  const [card, setCard] = useState<any>(null);

  const topUpScale = useRef(new Animated.Value(1)).current;
  const topUpExpand = useRef(new Animated.Value(0)).current;
  

  useFocusEffect(
    React.useCallback(() => {
      load();
    }, [])
  );

  const load = async () => {
    const b = await getBalance();
    const p = await getPayments();
    const c = await getCard();

    setBalance(b);
    setPayments(p);
    setCard(c);
  };

  // ==============================
  // TOP UP FUNCTION
  // ==============================
  const handleTopUp = async (amount: number) => {
    if (!card) {
      Alert.alert(
        'No Card Linked',
        'You need to add a card before topping up your wallet.',
        [
          {
            text: 'Add Card',
            onPress: () => navigation.navigate('AddCard'),
          },
          { text: 'Cancel', style: 'cancel' },
        ]
      );
      return;
    }
    const newBalance = await topUp(amount);

    // Save transaction
    await insertPayment({
      amount,
      method: 'topup',
      status: 'success',
      card_last4: card.last4,
    });

    setBalance(newBalance);

    // reload history
    const p = await getPayments();
    setPayments(p);

    setShowTopUpOptions(false);
  };

  // top up animation
  const animatePress = () => {
    Animated.sequence([
      Animated.timing(topUpScale, {
        toValue: 0.95,
        duration: 80,
        useNativeDriver: true,
      }),
      Animated.timing(topUpScale, {
        toValue: 1,
        duration: 80,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const animateExpand = (show: boolean) => {
    Animated.timing(topUpExpand, {
      toValue: show ? 1 : 0,
      duration: 200,
      useNativeDriver: true,
    }).start();
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
       <View style={styles.txInner}>
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
          {item.method === 'card'
            ? `💳 •••• ${item.card_last4 || '----'}`
            : item.method === 'topup'
            ? `💰 Top Up •••• ${item.card_last4 || '----'}`
            : '👛 Wallet'}
        </Text>

        <Text style={styles.txDate}>
          {formatDate(item.timestamp)}
        </Text>

      </View>
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
          <Animated.View style={{ transform: [{ scale: topUpScale }] }}>
            <TouchableOpacity
              style={styles.topUpMainBtn}
              onPress={() => {
                animatePress();
                setShowTopUpOptions(true);
                animateExpand(true);
              }}
            >
              <Text style={styles.topUpMainText}>Top Up</Text>
            </TouchableOpacity>
          </Animated.View>
        ) : (
          <Animated.View
            style={{
              opacity: topUpExpand,
              transform: [
                {
                  translateY: topUpExpand.interpolate({
                    inputRange: [0, 1],
                    outputRange: [10, 0],
                  }),
                },
              ],
            }}
          >
            <>
              <View style={styles.topUpRow}>
                {[10, 20, 50, 100].map((amt) => (
                  <TouchableOpacity
                    key={amt}
                    style={styles.topUpBtn}
                    onPress={() => handleTopUp(amt)}
                  >
                    <Text style={styles.topUpText}>+RM {amt}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* CANCEL */}
              <TouchableOpacity
                onPress={() => {
                  animatePress();
                  animateExpand(false);
                  setTimeout(() => setShowTopUpOptions(false), 200);
                }}
                style={styles.cancelBtn}
              >
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>
            </>
          </Animated.View>
        )}
      </View>

      {/* ================= CARD ================= */}
      <View style={styles.card}>
        <Text style={styles.label}>Payment Method</Text>

        {!card ? (
          <TouchableOpacity
            style={styles.addCardBtn}
            onPress={() => navigation.navigate('AddCard')}
          >
            <Text style={styles.addCardText}>Add Card</Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.cardPreviewMini}>

            {/* BRAND */}
            <View style={styles.cardHeader}>
              <Text style={styles.brandText}>
                {card.number?.startsWith('4')
                  ? 'VISA'
                  : /^5[1-5]/.test(card.number || '')
                  ? 'MASTERCARD'
                  : 'CARD'}
              </Text>
            </View>

            {/* NUMBER */}
            <Text style={styles.cardNumber}>
              **** **** **** {card.last4}
            </Text>

            {/* NAME + EXPIRY */}
            <View style={styles.cardRow}>
              <Text style={styles.cardName}>
                {card.name || 'CARD HOLDER'}
              </Text>

              <Text style={styles.cardExpiry}>
                {card.expiry || 'MM/YY'}
              </Text>
            </View>

            {/* REMOVE */}
            <TouchableOpacity
              onPress={async () => {
                await removeCard();
                load();
              }}
            >
              <Text style={styles.removeText}>
                Remove Card
              </Text>
            </TouchableOpacity>

          </View>
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
                <Text style={{ color: '#1f2937', fontWeight: 'bold', fontSize: 14 }}>
                  From: {tempStartDate ? tempStartDate.toDateString() : ' Select Start Date'}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.dateBtn}
                onPress={() => setShowEndPicker(true)}
              >
                <Text style={{ color: '#1f2937', fontWeight: 'bold', fontSize: 14 }}>
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
    backgroundColor: '#1f2937',
    padding: 15,
  },

  card: {
    backgroundColor: '#000000',
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
    backgroundColor: '#15743c',
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
    backgroundColor: '#000000',
    borderRadius: 6,
  },

  activeFilter: {
    backgroundColor: '#15743c',
  },

  calendarBtn: {
    padding: 6,
    backgroundColor: '#000000v',
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

  dateActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },

  applyBtn: {
    backgroundColor: '#15743c',
    padding: 10,
    borderRadius: 8,
  },

  clearBtn: {
    backgroundColor: '#ef4444',
    padding: 10,
    borderRadius: 8,
  },

  addCardBtn: {
    backgroundColor: '#2563eb',
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },

  addCardText: {
    color: 'white', 
    fontSize: 16, 
    fontWeight: 'bold',
  },

  cardText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },

  cardSub: {
    color: '#9ca3af',
    fontSize: 12,
  },

  cardPreviewMini: {
    backgroundColor: '#232a2c',
    borderRadius: 16,
    padding: 16,
    marginTop: 10,
  },

  cardHeader: {
    alignItems: 'flex-end',
    marginBottom: 10,
  },

  brandText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ffffff',
  },

  cardNumber: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    letterSpacing: 3,
    marginBottom: 10,
  },

  cardRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },

  cardName: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },

  cardExpiry: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },

  removeText: {
    color: '#ef4444',
    marginTop: 20,
    marginBottom: -5,
    fontWeight: 'bold',
    fontSize: 16,
    textAlign: 'right',
  },

  txCard: {
    backgroundColor: '#000000',
    padding: 12,
    borderRadius: 14,
    marginBottom: 2,
  },

  txInner: {
    backgroundColor: '#111827',
    padding: 12,
    borderRadius: 10,
    borderLeftWidth: 3,
    borderLeftColor: '#22c55e',
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