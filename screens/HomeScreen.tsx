import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  Alert,
} from 'react-native';
import { get, ref } from 'firebase/database';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { SafeAreaView } from 'react-native-safe-area-context';

import { db } from '../firebase';
import { RootStackParamList } from '../types';

type HomeNavProp = StackNavigationProp<RootStackParamList, 'Home'>;

const HomeScreen = () => {
  const navigation = useNavigation<HomeNavProp>();
  const [flights, setFlights] = useState<any[]>([]);
  const [userEmail, setUserEmail] = useState('');
  const [userName, setUserName] = useState('');

  useEffect(() => {
    const loadUser = async () => {
      const email = await AsyncStorage.getItem('currentUser');
      setUserEmail(email || '');

      const usersSnap = await get(ref(db, 'users'));
      if (email && usersSnap.exists()) {
        const users = usersSnap.val();
        const user = Object.values(users).find(
          (u: any) => u.email === email
        ) as { name: string };
        setUserName(user?.name || '');
      }
    };

    const fetchFlights = async () => {
      const snapshot = await get(ref(db, 'flights/'));
      if (snapshot.exists()) {
        const raw = snapshot.val();
        const allFlights = Object.values(raw);
        setFlights(allFlights);
      }
    };

    loadUser();
    fetchFlights();
  }, []);

  const handleLogout = async () => {
    await AsyncStorage.removeItem('currentUser');
    navigation.reset({
      index: 0,
      routes: [{ name: 'Welcome' }],
    });
  };

  const getLocationImage = (destination: string) => {
    const images: Record<string, any> = {
      phuket: require('../assets/cities/phuket.jpg'),
      bangkok: require('../assets/cities/bangkok.jpg'),
      chiangmai: require('../assets/cities/chiangmai.jpg'),
      krabi: require('../assets/cities/krabi.jpg'),
      hatyai: require('../assets/cities/hatyai.jpg'),
    };
    const key = destination.toLowerCase().replace(/\s/g, '');
    return images[key] || require('../assets/cities/default_flight.jpg');
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Top Bar */}
      <View style={styles.topBar}>
        <TouchableOpacity onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={26} color="#333" />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate('MyBookings')}>
          <Ionicons name="book-outline" size={26} color="#333" />
        </TouchableOpacity>
      </View>

      {/* User Info */}
      <View style={styles.profile}>
        <Image source={require('../assets/user.jpg')} style={styles.avatar} />
        <Text style={styles.name}>{userName || 'Welcome'}</Text>
        <Text style={styles.email}>{userEmail}</Text>
      </View>

      {/* Search Button */}
      <TouchableOpacity
        style={styles.searchButton}
        onPress={() => navigation.navigate('Search')}
      >
        <Ionicons name="search" size={18} color="#fff" style={{ marginRight: 8 }} />
        <Text style={styles.searchButtonText}>Search Flights</Text>
      </TouchableOpacity>

      {/* Flight List */}
      <FlatList
        data={flights}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() => navigation.navigate('FlightDetails', { flight: item })}
          >
            <View style={styles.card}>
              <Image source={getLocationImage(item.to)} style={styles.bannerImage} />
              <Text style={styles.flight}>{item.airline} - {item.flight_id}</Text>
              <Text style={styles.route}>{item.from} → {item.to}</Text>
              <Text style={styles.details}>{item.date} | {item.time}</Text>
            </View>
          </TouchableOpacity>
        )}
      />
    </SafeAreaView>
  );
};

export default HomeScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingHorizontal: 16,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 10,
    marginBottom: 10,
  },
  profile: {
    alignItems: 'center',
    marginBottom: 20,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: 8,
  },
  name: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  email: {
    fontSize: 14,
    color: '#555',
  },
  searchButton: {
    flexDirection: 'row',
    backgroundColor: '#36cfc9',
    padding: 12,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  searchButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  card: {
    backgroundColor: '#f8f8f8',
    borderRadius: 10,
    marginBottom: 12,
    overflow: 'hidden',
    elevation: 2,
  },
  bannerImage: {
    width: '100%',
    height: 140,
  },
  flight: {
    fontWeight: 'bold',
    fontSize: 16,
    marginTop: 8,
    paddingHorizontal: 10,
  },
  route: {
    color: '#555',
    paddingHorizontal: 10,
  },
  details: {
    color: '#888',
    fontSize: 12,
    paddingHorizontal: 10,
    marginBottom: 10,
  },
});
