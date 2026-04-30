import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity, Text, StyleSheet, Alert } from 'react-native';

import { login, signUp } from '../../services/api/authService';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');

  // ================= VALIDATION =================
  const validateEmail = (value: string) => {
    setEmail(value);

    const regex = /\S+@\S+\.\S+/;

    if (!value) {
      setEmailError('Email is required');
    } else if (!regex.test(value)) {
      setEmailError('Invalid email format');
    } else {
      setEmailError('');
    }
  };

  const validatePassword = (value: string) => {
    setPassword(value);

    if (!value) {
      setPasswordError('Password is required');
    } else if (value.length < 12) {
      setPasswordError('Minimum 12 characters required');
    } else {
      setPasswordError('');
    }
  };

  const isValid =
    email &&
    password &&
    emailError === '' &&
    passwordError === '';

  // ================= ACTIONS =================
  const handleLogin = async () => {
    if (!isValid) return;

    try {
      await login(email, password);
    } catch (e: any) {
      Alert.alert('Login Failed', e.message);
    }
  };

  const handleSignUp = async () => {
    if (!isValid) return;

    try {
      await signUp(email, password);
    } catch (e: any) {
      Alert.alert('Error', e.message);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>EZChargeEV User Login</Text>

      {/* ================= EMAIL ================= */}
      <TextInput
        placeholder="Email"
        placeholderTextColor="#aaa"
        style={[
          styles.input,
          !!emailError && styles.inputError,
        ]}
        value={email}
        onChangeText={validateEmail}
        keyboardType="email-address"
      />

      {emailError ? (
        <Text style={styles.errorText}>{emailError}</Text>
      ) : null}

      {/* ================= PASSWORD ================= */}
      <TextInput
        placeholder="Password"
        placeholderTextColor="#aaa"
        secureTextEntry
        style={[
          styles.input,
          !!passwordError && styles.inputError,
        ]}
        value={password}
        onChangeText={validatePassword}
      />

      {passwordError ? (
        <Text style={styles.errorText}>{passwordError}</Text>
      ) : null}

      {/* ================= LOGIN BUTTON ================= */}
      <TouchableOpacity
        style={[
          styles.btn,
          !isValid && styles.btnDisabled,
        ]}
        onPress={handleLogin}
        disabled={!isValid}
      >
        <Text style={styles.btnText}>Login</Text>
      </TouchableOpacity>

      {/* ================= SIGN UP ================= */}
      <TouchableOpacity
        style={styles.signupBtn}
        onPress={handleSignUp}
      >
        <Text style={styles.signupText}>Create Account</Text>
      </TouchableOpacity>
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

  title: {
    color: 'white',
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 30,
    textAlign: 'center',
  },

  input: {
    backgroundColor: '#1f2937',
    color: 'white',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
    fontSize: 16,
    fontWeight: 'bold',
  },

  btn: {
    backgroundColor: '#15743c',
    padding: 14,
    borderRadius: 10,
    alignItems: 'center',
  },

  btnText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },

  signupBtn: {
    marginTop: 15,
    alignItems: 'center',
    
  },

  signupText: {
    color: '#557bf8',
    textDecorationLine: 'underline',
    fontSize: 16,
    fontWeight: 'bold',
  },

  inputError: {
    borderWidth: 1,
    borderColor: '#ef4444',
  },

  errorText: {
    color: '#ef4444',
    fontSize: 13,
    marginBottom: 8,
    marginLeft: 2,
  },

  btnDisabled: {
    backgroundColor: '#374151',
  },
});