import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { db } from '../firebase';
import { ref, push } from 'firebase/database';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../types';
import AsyncStorage from '@react-native-async-storage/async-storage';


type BookingNav = StackNavigationProp<RootStackParamList, 'Booking'>;

const BookingScreen = () => {
  const route = useRoute();
  const navigation = useNavigation<BookingNav>();
  const { flight }: any = route.params;

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');

  const handleBooking = async () => {
    if (!name || !email) {
      Alert.alert('Missing Information', 'Please enter both name and email.');
      return;
    }
  
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      Alert.alert('Invalid Email', 'Please enter a valid email address.');
      return;
    }
  
    Alert.alert(
      'Confirm Booking',
      'Do you want to book this flight?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Yes',
          onPress: async () => {
            const userEmail = await AsyncStorage.getItem('currentUser');
            if (!userEmail) {
              Alert.alert('Error', 'User not logged in.');
              return;
            }
  
            const currentUser = userEmail.replace(/\./g, '_');
            const bookingRef = ref(db, `bookings/${currentUser}`);
            const newBooking = {
              name,
              email,
              flight_id: flight.flight_id,
              airline: flight.airline,
              from: flight.from,
              to: flight.to,
              date: flight.date,
              time: flight.time,
              booked_at: new Date().toISOString(),
            };
  
            try {
              await push(bookingRef, newBooking);
              Alert.alert('Booking Confirmed', 'Your flight has been booked successfully.');
              navigation.navigate("Tabs", { screen: "Search" });
            } catch (error: any) {
              console.log("Booking error:", error);
              Alert.alert('Error', 'Failed to book flight.');
            }
          }
        }
      ]
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Booking for {flight.airline} - {flight.flight_id}</Text>

      <TextInput
        style={styles.input}
        placeholder="Full Name"
        value={name}
        onChangeText={setName}
      />
      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
      />

      <TouchableOpacity style={styles.button} onPress={handleBooking}>
        <Text style={styles.buttonText}>Confirm Booking</Text>
      </TouchableOpacity>
    </View>
  );
};

export default BookingScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  header: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  input: {
    height: 50,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 6,
    paddingHorizontal: 10,
    marginBottom: 15,
  },
  button: {
    backgroundColor: '#36cfc9',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
