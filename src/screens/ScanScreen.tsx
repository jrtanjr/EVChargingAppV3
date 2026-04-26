import React, { useEffect } from 'react';
import { View, Text, Button } from 'react-native';

import {  getStations } from '../services/database/stationService';

export default function MapScreen() {

  // useEffect(() => {
  //   loadData();
  // }, []);

  // const loadData = async () => {
  //   await insertDummyStation();

  //   const data = await getStations();
  //   console.log('Stations:', data);
  // };

  return (
    <View>
      <Text>Map Screen</Text>
      {/* <Button title="Load Data" onPress={loadData} /> */}
    </View>
  );
}