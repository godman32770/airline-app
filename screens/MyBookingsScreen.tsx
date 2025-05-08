import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator, TouchableOpacity, Alert } from 'react-native';
import { db } from '../firebase';
import { ref, onValue } from 'firebase/database';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../types';
import { remove, child } from 'firebase/database';
import { get } from 'firebase/database';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import { useCallback } from 'react';
import Toast from 'react-native-toast-message';

type MyBookingsNavProp = StackNavigationProp<RootStackParamList, 'MyBookings'>;

const MyBookingsScreen = () => {
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation<MyBookingsNavProp>();
  const fetchBookings = async () => {
    const email = await AsyncStorage.getItem('currentUser');
    if (!email) return;

    const userId = email.replace(/\./g, '_');
    const snapshot = await get(ref(db, `bookings/${userId}`));
    if (snapshot.exists()) {
      const data = snapshot.val();
      const result = Object.entries(data).map(([key, value]) => {
        if (typeof value === 'object' && value !== null) {
          return { ...value, key };  // ← this ensures key is last and present
        }
        return { key, invalid: true };
      });
      setBookings(result);
    } else {
      setBookings([]);
    }
    setLoading(false);
  };

  const handleCancel =  async (bookingKey: string) => {
    Alert.alert(
      'Cancel Booking',
      'Are you sure you want to cancel this booking?',
      [
        { text: 'No', style: 'cancel' },
        {
          text: 'Yes',
          onPress: async () => {
            try {
              const email = await AsyncStorage.getItem('currentUser');
              if (!email) return;
          
              const userId = email.replace(/\./g, '_');
              await remove(ref(db, `bookings/${userId}/${bookingKey}`));
              await fetchBookings();
              Toast.show({
                type: 'success',
                text1: '✅ Booking canceled successfully',
                position: 'bottom',
              });
            } catch (error) {
              console.error('Cancel Error:', error);
              Alert.alert('Error', 'Failed to cancel booking.');
            }
          }
        },
      ]
    );
  };
  
  

  useFocusEffect(
    useCallback(() => {
  
      fetchBookings();
    }, [])
  );
  

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#36cfc9" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>My Bookings</Text>
      {bookings.length === 0 ? (
        <Text style={styles.empty}>You have no bookings yet.</Text>
      ) : (
        <FlatList
          data={bookings}
          keyExtractor={(item, index) => index.toString()}
          renderItem={({ item }) => (
            <TouchableOpacity onPress={() => navigation.navigate('FlightDetails', { flight: item })}>
              <View style={styles.card}>
                <Text style={styles.flight}>{item.airline} - {item.flight_id}</Text>
                <Text style={styles.route}>{item.from} → {item.to}</Text>
                <Text style={styles.details}>{item.date} | {item.time}</Text>
                <Text style={styles.details}>Booked by: {item.name} ({item.email})</Text>

                {item.booked_at && (
                  <Text style={styles.details}>
                    Booked at: {new Date(item.booked_at).toLocaleString()}
                  </Text>
                )}

                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={() => handleCancel(item.key)}
                >
                  <Text style={styles.cancelText}>Cancel Booking</Text>
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          )}
        />
      )}
    </View>
  );
};

export default MyBookingsScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  card: {
    padding: 12,
    marginBottom: 10,
    backgroundColor: '#f1f1f1',
    borderRadius: 8,
  },
  flight: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  route: {
    fontSize: 16,
    marginVertical: 2,
  },
  details: {
    fontSize: 14,
    color: '#666',
  },
  empty: {
    marginTop: 50,
    fontSize: 16,
    textAlign: 'center',
    color: '#888',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cancelButton: {
    marginTop: 10,
    padding: 10,
    backgroundColor: '#ff4d4f',
    borderRadius: 6,
    alignItems: 'center',
  },
  cancelText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});
