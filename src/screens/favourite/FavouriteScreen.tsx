import React, { useState  } from 'react';
import { View, Text, FlatList } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';

import { getStations } from '../../services/database/stationService';
import { getFavourites } from '../../services/storage/favouriteService';

export default function FavouriteScreen() {
  const [data, setData] = useState<any[]>([]);

  useFocusEffect(
    React.useCallback(() => {
      loadFavourites();
    }, [])
  );

  const loadFavourites = async () => {
    const favIds = await getFavourites();
    const stations = await getStations();

    const favStations = stations.filter(s => favIds.includes(Number(s.id)));

    setData(favStations);

  };

  return (
    <View>
      <FlatList
        data={data}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View style={{ padding: 10, borderBottomWidth: 1 }}>
            <Text style={{ fontWeight: 'bold' }}>{item.name}</Text>
            <Text>{item.address}</Text>
          </View>
        )}
      />
    </View>
  );
}