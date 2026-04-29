import React, { useState, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, Animated } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { getBalance } from '../../services/storage/walletService';
import { getCard } from '../../services/storage/cardService';

export default function PaymentSelectionScreen({ route, navigation }: any) {
  const { station, connectors } = route.params;

  const [method, setMethod] = useState<'card' | 'wallet' | null>(null);
  const [balance, setBalance] = useState(0);
  const [selectedAmount, setSelectedAmount] = useState<number | null>(null);
  const [card, setCard] = useState<any>(null);

  const walletOptions = [5, 10, 20, 50, 80, 100, 150];

  // 🎬 animation
  const cardScale = useRef(new Animated.Value(1)).current;
  const walletScale = useRef(new Animated.Value(1)).current;

  const animateSelect = (anim: Animated.Value) => {
    Animated.sequence([
      Animated.timing(anim, {
        toValue: 0.96,
        duration: 80,
        useNativeDriver: true,
      }),
      Animated.timing(anim, {
        toValue: 1,
        duration: 80,
        useNativeDriver: true,
      }),
    ]).start();
  };

  useFocusEffect(
      React.useCallback(() => {
        load();
      }, [])
    );

  const load = async () => {
    const b = await getBalance();
    const c = await getCard();
    setBalance(b);
    setCard(c);
  };

  const handleStart = () => {
    if (!method) return;

    if (method === 'wallet') {
      if (!selectedAmount) return;

      if (balance < selectedAmount) {
        Alert.alert(
          'Insufficient Balance',
          'Please top up your wallet!',
          [
            {
              text: 'Top Up',
              onPress: () => navigation.navigate('Payment & Wallet'),
            },
            { text: 'Cancel' },
          ]
        );
        return;
      }
    }

    navigation.navigate('ChargingScreen', {
      station,
      connectors,
      paymentMethod: method,
      budget: method === 'wallet' ? selectedAmount : 150,
      cardLast4: card?.last4 || null,
    });
  };

  const isDisabled =
    !method || (method === 'wallet' && !selectedAmount);

  return (
    <View style={styles.container}>

      <Text style={styles.title}>Select Your Payment Method</Text>

      {/* ================= CARD ================= */}
      <Animated.View style={{ transform: [{ scale: cardScale }] }}>
        <TouchableOpacity
          style={[
            styles.cardOption,
            method === 'card' && styles.selectedCard,
            !card && styles.disabledCard,
          ]}
          onPress={() => {
            if (!card) {
              Alert.alert(
                'No Card Linked',
                'Please add a card first',
                [
                  {
                    text: 'Add Card',
                    onPress: () => navigation.navigate('AddCard'),
                  },
                  { text: 'Cancel' },
                ]
              );
              return;
            }

            animateSelect(cardScale);
            setMethod('card');
          }}
        >
          <Text style={styles.optionTitle}>💳 Card</Text>
          <Text style={styles.optionSub}>
            {card ? `•••• ${card.last4}` : 'No card linked'}
          </Text>
        </TouchableOpacity>
      </Animated.View>

      {!card && (
        <TouchableOpacity
          onPress={() => navigation.navigate('AddCard')}
          style={styles.linkBtn}
        >
          <Text style={styles.linkText}>+ Add Card</Text>
        </TouchableOpacity>
      )}

      {/* ================= WALLET ================= */}
      <Animated.View style={{ transform: [{ scale: walletScale }] }}>
        <TouchableOpacity
          style={[
            styles.cardOption,
            method === 'wallet' && styles.selectedCard,
          ]}
          onPress={() => {
            animateSelect(walletScale);
            setMethod('wallet');
          }}
        >
          <Text style={styles.optionTitle}>👛 Wallet</Text>
          <Text style={styles.optionSub}>
            Balance: RM {balance.toFixed(2)}
          </Text>
        </TouchableOpacity>
      </Animated.View>

      {/* ================= WALLET OPTIONS ================= */}
      {method === 'wallet' && (
        <View style={styles.walletGrid}>
          {walletOptions.map((amount) => (
            <TouchableOpacity
              key={amount}
              style={[
                styles.amountCard,
                selectedAmount === amount && styles.amountSelected,
              ]}
              onPress={() => setSelectedAmount(amount)}
            >
              <Text
                style={[
                  styles.amountText,
                  selectedAmount === amount && { color: 'white' },
                ]}
              >
                RM {amount}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* ================= SUMMARY ================= */}
      {method && (
        <View style={styles.summaryBox}>
          <Text style={styles.summaryText}>
            {method === 'card'
              ? `Pay with Card •••• ${card?.last4}`
              : `Wallet • RM ${selectedAmount || 0}`}
          </Text>
        </View>
      )}

      {/* ================= BUTTON ================= */}
      <TouchableOpacity
        style={[
          styles.startBtn,
          isDisabled && styles.disabledBtn,
        ]}
        onPress={handleStart}
        disabled={isDisabled}
      >
        <Text style={styles.startText}>Start Charging ⚡</Text>
      </TouchableOpacity>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a',
    padding: 20,
    justifyContent: 'center',
  },

  title: {
    color: 'white',
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20,
  },

  cardOption: {
    backgroundColor: '#1f2937',
    padding: 20,
    borderRadius: 16,
    marginBottom: 15,
  },

  selectedCard: {
    borderWidth: 2,
    borderColor: '#22c55e',
  },

  disabledCard: {
    opacity: 0.5,
  },

  optionTitle: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },

  optionSub: {
    color: '#9ca3af',
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 5,
  },

  linkBtn: {
    marginBottom: 15,
  },

  linkText: {
    color: '#3b82f6',
    fontWeight: 'bold',
  },

  walletGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 15,
  },

  amountCard: {
    width: '31%',
    margin: '1%',
    paddingVertical: 16,
    borderRadius: 12,
    backgroundColor: '#1f2937',
    alignItems: 'center',
  },

  amountSelected: {
    backgroundColor: '#22c55e',
  },

  amountText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },

  summaryBox: {
    backgroundColor: '#1f2937',
    padding: 12,
    borderRadius: 12,
    marginTop: 15,
  },

  summaryText: {
    color: '#22c55e',
    fontWeight: 'bold',
    fontSize: 16,
    textAlign: 'center',
  },

  startBtn: {
    marginTop: 25,
    backgroundColor: '#058f38',
    padding: 16,
    borderRadius: 14,
    alignItems: 'center',
  },

  disabledBtn: {
    backgroundColor: '#374151',
  },

  startText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
});