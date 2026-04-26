import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';

import { getBalance } from '../../services/storage/walletService';

export default function PaymentSelectionScreen({ route, navigation }: any) {
  const { station, connectors } = route.params;

  const [method, setMethod] = useState<'card' | 'wallet' | null>(null);
  const [balance, setBalance] = useState(0);
  const [selectedAmount, setSelectedAmount] = useState<number | null>(null);

  const walletOptions = [5, 10, 20, 50, 80, 100, 150];

  useEffect(() => {
    loadBalance();
  }, []);

  const loadBalance = async () => {
    const b = await getBalance();
    setBalance(b);
  };

  const handleStart = () => {
    if (!method) {
      Alert.alert('Select payment method');
      return;
    }

    if (method === 'wallet') {
      if (!selectedAmount) {
        Alert.alert('Select wallet amount');
        return;
      }

      if (balance < selectedAmount) {
        Alert.alert(
          'Insufficient Balance',
          'Please top up your wallet !',
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
      budget: method === 'wallet' ? selectedAmount : 150, // card = 150 hold
    });
  };

  return (
    <View style={styles.container}>

      <Text style={styles.title}>Select Payment Method</Text>

      {/* CARD OPTION */}
      <TouchableOpacity
        style={[
          styles.option,
          method === 'card' && styles.selected,
        ]}
        onPress={() => setMethod('card')}
      >
        <Text style={styles.optionText}>Bank Card ( Hold Amount up to RM150 )</Text>
      </TouchableOpacity>

      {/* WALLET OPTION */}
      <TouchableOpacity
        style={[
          styles.option,
          method === 'wallet' && styles.selected,
        ]}
        onPress={() => setMethod('wallet')}
      >
        <Text style={styles.optionText}>
          Wallet (Balance: RM {balance.toFixed(2)})
        </Text>
      </TouchableOpacity>

      {/* WALLET AMOUNT */}
      {method === 'wallet' && (
        <View style={styles.walletContainer}>
          {walletOptions.map((amount) => (
            <TouchableOpacity
              key={amount}
              style={[
                styles.amountBtn,
                selectedAmount === amount && styles.selectedAmount,
              ]}
              onPress={() => setSelectedAmount(amount)}
            >
              <Text>RM {amount}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* START BUTTON */}
      <TouchableOpacity style={styles.startBtn} onPress={handleStart}>
        <Text style={styles.startText}>Start Charging</Text>
      </TouchableOpacity>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#c4cad7',
    padding: 25,
    justifyContent: 'center',
    
  },

  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },

  option: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
  },

  selected: {
    borderWidth: 3,
    borderColor: '#3a3f3c',
    backgroundColor: '#1c994e',
  },

  optionText: {
    fontSize: 16,
    fontWeight: 'bold',
  },

  walletContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 10,
  },

  amountBtn: {
    backgroundColor: 'white',
    padding: 10,
    borderRadius: 8,
    margin: 5,
  },

  selectedAmount: {
    backgroundColor: '#1c994e',
    borderWidth: 2,
    borderColor: '#3a3f3c',
  },

  startBtn: {
    marginTop: 30,
    backgroundColor: '#1c994e',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },

  startText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
});