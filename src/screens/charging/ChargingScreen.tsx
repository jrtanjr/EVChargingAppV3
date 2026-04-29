import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated, Easing } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

import { insertChargingHistory } from '../../services/database/chargingService';
import { insertPayment } from '../../services/database/paymentService';
import { getBalance, setBalance } from '../../services/storage/walletService';
import { getCard } from '../../services/storage/cardService';

export default function ChargingScreen({ route, navigation }: any) {
  const { station, connectors, paymentMethod, budget, cardLast4 } = route.params;

  // ==============================
  // CONSTANTS
  // ==============================
  const batteryCapacity = 60; // kWh
  const initialBattery = 50;

  const AC_RATE = 0.57;
  const DC_RATE = 1.20;

  const SIMULATION_SPEED = 20; // Speed up time by 20x for demo purposes

  // ==============================
  // STATE
  // ==============================
  const [battery, setBattery] = useState(initialBattery);
  const [selectedConnector, setSelectedConnector] = useState<any>(null);

  const [isCharging, setIsCharging] = useState(false);
  const [isFull, setIsFull] = useState(false);
  const [hasDisconnected, setHasDisconnected] = useState(false); // track if user wants to disconnect before full charge
  
  const [energy, setEnergy] = useState(0);
  const [idleTime, setIdleTime] = useState(0);
  const [seconds, setSeconds] = useState(0);

  const animatedValue = useState(new Animated.Value(initialBattery))[0]; // for smooth battery animation

  // ==============================
  // AVAILABLE CONNECTORS
  // ==============================
  const availableConnectors = connectors.filter((c: any) => c.available > 0);

  const power = selectedConnector?.power_kw || 0;

  const chargingRate =
    selectedConnector?.current_type?.includes('DC')
      ? DC_RATE
      : AC_RATE;

  // ==============================
  // CHARGING LOGIC (REALISTIC)
  // ==============================
  useEffect(() => {
    if (!isCharging || !selectedConnector) return;

    const interval = setInterval(() => {

      setSeconds(prev => prev + 1);

      setEnergy(prevEnergy => {
        const newEnergy = prevEnergy + (power / 3600) * SIMULATION_SPEED; 

        const newChargingCost = newEnergy * chargingRate;

        // Check if budget exceeded
        if (newChargingCost >= budget) {
          setIsCharging(false);
          setHasDisconnected(true);
        }

        const percentage =
          initialBattery + (newEnergy / batteryCapacity) * 100;

        if (percentage >= 100) {
          setBattery(100);
          setIsFull(true);
          setIsCharging(false);
        } else {
          setBattery(percentage);
        }

        return newEnergy;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isCharging, selectedConnector]);

  // ==============================
  // BATTERY ANIMATION
  // ==============================
  useEffect(() => { 
    Animated.timing(animatedValue, {
      toValue: battery,
      duration: 500,
      easing: Easing.out(Easing.ease),
      useNativeDriver: false,
    }).start();
  }, [battery]);

  // ==============================
  // IDLE LOGIC (KEEP THIS 🔥)
  // ==============================
  useEffect(() => {
    if (!hasDisconnected && !isFull) return;

    const idleInterval = setInterval(() => {
      setIdleTime(prev => prev + 1);
    }, 1000);

    return () => clearInterval(idleInterval);
  }, [hasDisconnected, isFull]);

  // ==============================
  // COST
  // ==============================
  const chargingCost = energy * chargingRate;
  const idleCost = Math.floor(idleTime / 300) * 1;

  const totalCost = chargingCost + idleCost;

  // ==============================
  // REMAINING TIME AND ENERGY
  // ==============================
  const remainingEnergy = Math.max(
    batteryCapacity * (1 - battery / 100),
    0
  );

  const remainingTime =
    battery >= 100 || power === 0
      ? 0
      : (remainingEnergy / power) * 3600;

  
  // ==============================
  // FINISH CHARGING (SAVE TO DB, DEDUCT WALLET, ETC)
  // ==============================
  const handleFinish = async (status: 'completed' | 'stopped') => {
    if (!selectedConnector || power === 0) return;

      const totalCost = chargingCost + idleCost;

      let walletBalance = await getBalance();

      // CARD PAYMENT FLOW
      if (paymentMethod === 'card') { 
        if (totalCost > 150) {
          const overflow = totalCost - 150;

          walletBalance -= overflow; // deduct overflow from wallet if exceeds card limit
          await setBalance(walletBalance);
        }

        const card = await getCard();

        await insertPayment({
          charging_id: Date.now(),
          amount: totalCost,
          method: 'card',
          status: 'paid',
          card_last4: card?.last4 || null,
        });

      } else {
        // WALLET PAYMENT FLOW
        const refund = budget - chargingCost;

        walletBalance -= chargingCost; // deduct charging cost
        walletBalance -= idleCost; // deduct idle cost

        await setBalance(walletBalance);

        await insertPayment({
          charging_id: Date.now(),
          amount: totalCost,
          method: 'wallet',
          status: 'paid',
          card_last4: null,
        });
      }

      await insertChargingHistory({
        station_id: station.id,
        energy,
        duration: seconds + idleTime,
        cost: totalCost,
        status,
      });

      navigation.navigate('ChargingResult', {
        energy,
        chargingCost,
        idleCost,
      });
    };

  // ==============================
  // FORMAT TIME HELPER
  // ==============================
  const formatTime = (seconds: number) => {
    const min = Math.floor(seconds / 60);
    const sec = Math.floor(seconds % 60);
    return `${min}m ${sec}s`;
  };

  // ==============================
  // UI
  // ==============================
  return (
    <View style={styles.container}>
      
      <Text style={styles.title}>{station.name}</Text>

      {/* CONNECTOR */}
      {!selectedConnector && (
        <View style={styles.connectorBox}>
          <Text style={styles.label}>Select Connector</Text>

          {availableConnectors.map((c: any, index: number) => {
            const isDC = c.current_type?.toUpperCase().includes('DC');

            return (
              <TouchableOpacity
                key={index}
                style={[
                  styles.connectorCard,
                  selectedConnector === c && styles.selectedCard,
                ]}

                onPress={() => setSelectedConnector(c)}
              >
                {/* LEFT ICON */}
                <View
                  style={[
                    styles.iconBox,
                    { backgroundColor: isDC ? '#f97316' : '#3b82f6' },
                  ]}
                >
                  <Icon
                    name={isDC ? 'flash' : 'power-plug'}
                    size={20}
                    color="white"
                  />
                </View>

                {/* INFO */}
                <View style={styles.connectorInfo}>
                  <Text style={styles.connectorType}>
                    {isDC ? 'DC Fast Charger' : 'AC Charger'}
                  </Text>

                  <Text style={styles.connectorSub}>
                    {c.power_kw} kW • {c.current_type}
                  </Text>

                  <Text style={styles.connectorAvailable}>
                    {c.available} / {c.quantity} available
                  </Text>
                </View>

                {/* RIGHT STATUS */}
                <View style={styles.rightSelection}>
                  <View
                    style={[
                    styles.availabilityBadge,
                    { 
                      backgroundColor: 
                        c.available > 0 ? '#22c55e' : '#ef4444',
                      },
                  ]}
                >
                    <Text style={styles.badgeText}>
                      {c.available > 0 ? 'Available' : 'Full'}
                    </Text>
                  </View>

                <Icon name="chevron-right" size={20} color="#9ca3af" />
              </View>

            </TouchableOpacity>
          );
        })}

            <View style={styles.paymentBox}>
              <Text style={styles.paymentLabel}>
                Selected Payment Method
              </Text>

              <Text style={styles.paymentValue}>
                {paymentMethod === 'card'
                   ? `Card •••• ${cardLast4} (Hold RM ${budget})`
                   : `Wallet (RM ${budget})`}
              </Text>
            </View>

        </View>

      )}

      {/* ==============================
          BATTERY DISPLAY
      ============================== */}
      {selectedConnector && (
        <>
          <Animated.View
            style={[
              styles.batteryBox,
              {
                borderColor: animatedValue.interpolate({
                  inputRange: [0, 50, 80, 100],
                  outputRange: ['#ef4444', '#fd8625', '#e2f916', '#22c55e'],
                }),
                transform: [
                  {
                    scale: animatedValue.interpolate({
                      inputRange: [0, 100],
                      outputRange: [0.9, 1.1],
                    }),
                  },
                ],
              },
            ]}
          >
            <Text style={styles.batteryText}>
              {battery.toFixed(0)}%
            </Text>
          </Animated.View>

          {/* STATUS */}
          {!isCharging && !isFull && (
            <Text style={styles.status}>
              {hasDisconnected ? 'Charging Stopped' : 'Ready to Charge'}
            </Text>
          )}

          {isCharging && (
            <Text style={styles.status}>Charging ⚡</Text>
          )}

          {(isCharging || hasDisconnected) && (
            <View style={{ alignItems: 'center', marginBottom: 15 }}>
              <Text style={{ color: 'white', marginBottom: 5, fontWeight: 'bold', fontSize: 16 }}>
                Speed: {power} kW
              </Text>

              <Text style={{ color: 'white', marginBottom: 5, fontWeight: 'bold', fontSize: 16 }}>
                Remaining Time: {formatTime(remainingTime)}
              </Text>

              <Text style={{ color: 'white', marginBottom: 5, fontWeight: 'bold', fontSize: 16 }}>
                Cost: RM {chargingCost.toFixed(2)}
              </Text>
            </View>
          )}

          {hasDisconnected && !isFull && (
            <>
              <Text style={styles.warning}>
                Charger stopped — idle fees may apply ⚠️
              </Text>

              <Text style={styles.idle}>
                Idle Time: {formatTime(idleTime)}
              </Text>
            </>
          )}

          {isFull && (
            <>
              <Text style={styles.full}>
                {isFull ? 'Fully Charged' : 'Charging Stopped'}
              </Text>

              <Text style={styles.warning}>
                Move your vehicle to avoid idle fees
              </Text>

              <Text style={styles.idle}>
                Idle Time: {formatTime(idleTime)}
              </Text>
            </>
          )}

          {/* ==============================
                BUTTON LOGIC (FINAL CLEAN)
            ============================== */}

            {/* BEFORE START (FIRST TIME ONLY) */}
            {!isCharging && !isFull && !hasDisconnected && (
              <TouchableOpacity
                style={styles.startBtn}
                onPress={() => setIsCharging(true)}
              >
                <Text style={styles.btnText}>Start Charging</Text>
              </TouchableOpacity>
            )}

            {/* DURING CHARGING */}
            {isCharging && (
              <TouchableOpacity
                style={styles.disconnectBtn}
                onPress={() => {
                  setIsCharging(false);
                  setHasDisconnected(true); // pause session
                }}
              >
                <Text style={styles.btnText}>Stop Charging</Text>
              </TouchableOpacity>
            )}

            {/* AFTER DISCONNECT (NOT FULL) */}
            {hasDisconnected && !isFull && (
              <View style={styles.rowButtons}>
                {/* Resume */}
                <TouchableOpacity
                  style={[styles.startBtn, { flex: 1, marginRight: 5 }]}
                  onPress={() => {
                    setIsCharging(true);
                    setHasDisconnected(false); // reset
                  }}
                >
                  <Text style={styles.btnText}>Resume Charging</Text>
                </TouchableOpacity>

                {/* Leave */}
                <TouchableOpacity
                  style={[styles.leaveBtn, { flex: 1, marginLeft: 5 }]}
                  onPress={() => handleFinish('stopped')}
                >
                  <Text style={styles.btnText}>I've Left</Text>
                </TouchableOpacity>
              </View>
            )}

            {/* AFTER FULL */}
            {isFull && (
              <TouchableOpacity
                style={styles.leaveBtn}
                onPress={() => handleFinish('completed')}
              >
                <Text style={styles.btnText}>I've Left</Text>
              </TouchableOpacity>
            )}
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },

  title: {
    color: 'white',
    fontSize: 24,
    marginBottom: 20,
    fontWeight: 'bold',
  },

  label: {
    color: 'white',
    marginBottom: 10,
    fontSize: 16,
    fontWeight: 'bold',
  },

  connectorBox: {
    width: '100%',
    marginBottom: 20,
    
  },

  batteryBox: {
    width: 150,
    height: 150,
    borderRadius: 75,
    borderWidth: 6,
    borderColor: '#22c55e',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },

  batteryText: {
    fontSize: 32,
    color: 'white',
    fontWeight: 'bold',
  },

  status: {
    color: '#22c55e',
    fontSize: 16,
    marginBottom: 20,
    fontWeight: 'bold',
  },

  full: {
    color: '#facc15',
    fontSize: 18,
    fontWeight: 'bold',
  },

  warning: {
    color: '#f87171',
    marginTop: 5,
    fontSize: 16,
    fontWeight: 'bold',
  },

  idle: {
    color: 'white',
    marginTop: 10,
    fontSize: 16,
    fontWeight: 'bold',
  },

  startBtn: {
    marginTop: 30,
    backgroundColor: '#15743c',
    padding: 12,
    borderRadius: 8,
    width: '80%',
    alignItems: 'center',
  },

  disconnectBtn: {
    marginTop: 30,
    backgroundColor: '#ef4444',
    padding: 12,
    borderRadius: 8,
    width: '80%',
    alignItems: 'center',
  },

  leaveBtn: {
    marginTop: 30,
    backgroundColor: '#ef4444',
    padding: 12,
    borderRadius: 8,
    width: '80%',
    alignItems: 'center',
  },

  btnText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },

  connectorCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 14,
    marginBottom: 12,
    backgroundColor: '#1f2937',
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 4,
  },

  selectedCard: {
    borderWidth: 2,
    borderColor: '#22c55e',
  },

  iconBox: {
    width: 42,
    height: 42,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },

  connectorInfo: {
    flex: 1,
    marginLeft: 12,
  },

  connectorType: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 15,
  },

  connectorSub: {
    color: '#9ca3af',
    fontSize: 12,
    marginTop: 2,
  },

  connectorAvailable: {
    color: '#22c55e',
    fontWeight: 'bold',
    marginTop: 4,
  },

  rightSelection: {
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    height: 40,
  },

  availabilityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },

  badgeText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },

  rowButtons: {
    flexDirection: 'row',
    marginTop: 20,
    width: '100%',
  },

  paymentBox: {
    backgroundColor: '#1f2937',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    alignItems: 'center',
  },

  paymentLabel: {
    color: '#9ca3af',
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 5,
  },

  paymentValue: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  
});