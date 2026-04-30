import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Linking } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const FAQS = [
  {
    question: 'How to start charging?',
    answer:
      'Select the nearby EV station from the map, choose your payment method, then select a connector, and press Start Charging.',
  },
  {
    question: 'How do I pay?',
    answer:
      'You can pay using your linked card or wallet. Card will be charged hold amount of RM150 and refund balance after session, while wallet deducts upfront.',
  },
  {
    question: 'How to top up wallet?',
    answer:
      'Go to Payment screen, tap Top Up, select amount, and confirm using your linked card.',
  },
  {
    question: 'What is idle fee?',
    answer:
      'Idle fee is charged when your vehicle remains occupying the charging slot after reaching full charge or manual stopping. The first 1 minutes are free. ',
  },
  {
    question: 'How is idle fee calculated?',
    answer:
      'Idle fee is typically RM1 per 5 minutes.',
  },
];

export default function HelpScreen() {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [showSupport, setShowSupport] = useState(false);

  const toggle = (index: number) => {
    setActiveIndex(activeIndex === index ? null : index);
  };

  const toggleSupport = () => {
    setShowSupport(!showSupport);
  };

  const handleCall = (phone: string) => {
    Linking.openURL(`tel:${phone}`);
  };

  return (
    <ScrollView
      style={styles.container}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.titleRow}>
        <Icon name="information-outline" size={28} color="#22c55e" />
        <Text style={styles.title}>Help & FAQ</Text>
      </View>

      {/* ================= FAQ ================= */}
      {FAQS.map((item, index) => {
        const isOpen = activeIndex === index;

        return (
          <TouchableOpacity
            key={index}
            activeOpacity={0.8}
            style={[
              styles.card,
              isOpen && styles.activeCard,
            ]}
            onPress={() => toggle(index)}
          >
            <View style={styles.row}>
              <Text style={styles.question}>{item.question}</Text>

              <Icon
                name={isOpen ? 'chevron-up' : 'chevron-down'}
                size={30}
                color={isOpen ? '#22c55e' : '#9ca3af'}
              />
            </View>

            {isOpen && (
              <View style={styles.answerBox}>
                <Text style={styles.answer}>{item.answer}</Text>
              </View>
            )}
          </TouchableOpacity>
        );
      })}

      {/* ================= CONTACT SUPPORT ================= */}
      <TouchableOpacity
        style={styles.supportBtn}
        onPress={toggleSupport}
      >
        <Text style={styles.supportBtnText}>
          Contact Support
        </Text>
      </TouchableOpacity>

      {showSupport && (
        <View style={styles.answerBox}>

          <View style={styles.supportHeader}>
            <Icon name="headset" size={18} color="#22c55e" />
            <Text style={styles.supportTitle}>Customer Support</Text>
          </View>

          <Text style={styles.answer}>
            Need help? You can contact us via phone or WhatsApp.
          </Text>

          <TouchableOpacity onPress={() => handleCall('0121234567')}>
            <Text style={styles.supportNumber}>
              📞 012-1234567
            </Text>
          </TouchableOpacity>

          <Text style={styles.supportSub}>
            Mon–Fri • 9AM – 6PM
          </Text>

        </View>
      )}

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#020617',
    paddingHorizontal: 15, // 🔥 full width feel
    paddingTop: 20,
  },
  
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },

  title: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
    marginLeft: 8,
  },

  card: {
    backgroundColor: '#1f2937',
    borderRadius: 14,
    padding: 16,
    marginBottom: 14,
    width: '100%',
  },

  activeCard: {
    borderWidth: 1.5,
    borderColor: '#22c55e',
  },

  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  question: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 20,
    flex: 1,
  },

  answerBox: {
    marginTop: 12,
    backgroundColor: '#111827', // darker layer
    padding: 14,
    borderRadius: 10,
    borderLeftWidth: 3,
    borderLeftColor: '#22c55e', // subtle accent
  },

  answer: {
    color: '#e5e7eb',
    lineHeight: 24,
    fontSize: 16,
  },

  // ================= SUPPORT =================
  supportBtn: {
    marginTop: 20,
    backgroundColor: '#15743c',
    padding: 14,
    borderRadius: 12,
    alignItems: 'center',
  },

  supportBtnText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 18,
  },

  supportHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },

  supportTitle: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
    marginLeft: 6,
  },

  supportNumber: {
    color: '#22c55e',
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 8,
  },

  supportSub: {
    color: '#9ca3af',
    fontSize: 16,
    marginTop: 4,
  },
});