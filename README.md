This is a demo Android Mobile project for Wireless Application Development course. Using Android Studio Simulator.

<img width="650" height="650" alt="EZChargeEV Icon" src="https://github.com/user-attachments/assets/f82bd484-f3dc-4f48-9f7c-40b32794ff2d" />


# 🚀 Setup Guide

After Cloning to your local device, run the following commands:

## 1. Install dependencies
npm install

## 2. Clean Android build
cd android
gradlew clean
cd ..

## 3. Run app
npx react-native run-android


Project Details:

This native app fetch EV stations information from Open Charge Map API, and connected to Google Map Android SDK API for Google Map View. The cloud connection are connected to supabase.

The Main features for this EV Car Charging Management Apps are:

1. Search for nearest EV Charging Stations
2. Filter EV stations based on category (Residence, Shopping Mall...)
3. Connect to Charger and Start Charging - Simulated
4. Save favourite EV Charging stations for easy access
5. Nearby EV Charging Station suggestions
6. Manage payments (Top Up, Pay by Card or Wallet) - Simulated
7. View Charging History (With Date filter using DateTimePicker)
8. Manage User Profile

Remarks: 

1. Charging History are sync to supabase for cloud connectivity
2. All EV Stations's availavle charger plug data are randomized
3. Charging, Payment are simulated as this is a student-based project
4. User credentials are managed using supabase authentication