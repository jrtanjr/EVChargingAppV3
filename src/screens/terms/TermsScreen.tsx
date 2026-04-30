import React from 'react';
import { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const TERMS = [
  {
    title: 'General Use',
    content:
      'By using this EZChargeEV App, you agree to comply with all applicable laws and regulations. The app provides charging station information and simulation services.',
  },
  {
    title: 'Charging Sessions',
    content:
      'Users are responsible for monitoring their charging sessions. Charges are calculated based on energy consumption and applicable fees.',
  },
  {
    title: 'Payment',
    content:
      'Payments can be made via linked card or wallet. Card payments are charged after session, while wallet payments are deducted upfront.',
  },
  {
    title: 'Idle Fees',
    content:
      'Idle fees apply when a vehicle remains connected after charging is complete or manually stopped. Users should disconnect promptly.',
  },
  {
    title: 'Liability',
    content:
      'We are not responsible for any inaccuracies in station data, delays, or damages arising from the use of this app.',
  },
  {
    title: 'Updates',
    content:
      'Terms may be updated periodically. Continued use of the app indicates acceptance of the updated terms.',
  },
];

export default function TermsScreen() {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const toggle = (index: number) => {
    setActiveIndex(activeIndex === index ? null : index);
  };

  return (
    <ScrollView
      style={styles.container}
      showsVerticalScrollIndicator={false}
    >
      {/* TITLE */}
      <View style={styles.titleRow}>
        <Icon name="file-document-outline" size={28} color="#22c55e" />
        <Text style={styles.title}>Terms & Conditions</Text>
      </View>

      {/* TERMS CARDS */}
      {TERMS.map((item, index) => {
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
              <Text style={styles.sectionTitle}>{item.title}</Text>

              <Icon
                name={isOpen ? 'chevron-up' : 'chevron-down'}
                size={30}
                color={isOpen ? '#22c55e' : '#9ca3af'}
              />
            </View>

            {isOpen && (
              <View style={styles.answerBox}>
                <Text style={styles.text}>{item.content}</Text>
              </View>
            )}
          </TouchableOpacity>
        );
      })}

      {/* FOOTER */}
      <Text style={styles.footer}>
        Last updated: April 2026
      </Text>

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#020617',
    paddingHorizontal: 15,
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
    marginLeft: 8,
  },

  card: {
    backgroundColor: '#1f2937',
    borderRadius: 14,
    padding: 16,
    marginBottom: 14,
  },

  activeCard: {
    borderWidth: 1.5,
    borderColor: '#22c55e',
  },

  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  sectionTitle: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 20,
    flex: 1,
  },

  answerBox: {
    marginTop: 12,
    backgroundColor: '#111827',
    padding: 14,
    borderRadius: 10,
    borderLeftWidth: 3,
    borderLeftColor: '#22c55e',
  },

  text: {
    color: '#e5e7eb',
    lineHeight: 24,
    fontSize: 16,
  },

  footer: {
    color: '#9ca3af',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 20,
    marginBottom: 30,
  },
});