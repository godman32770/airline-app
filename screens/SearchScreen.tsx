import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Image,
  ImageBackground,
  Platform,
  Modal,
  Pressable,
  Alert,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { db } from '../firebase';
import { ref, get } from 'firebase/database';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../types'; 

const SearchScreen = () => {
  const [flights, setFlights] = useState<any[]>([]);
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [results, setResults] = useState<any[]>([]);
  const [showFromModal, setShowFromModal] = useState(false);
  const [showToModal, setShowToModal] = useState(false);

  type SearchScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Search'>;
  const navigation = useNavigation<SearchScreenNavigationProp>();

  useEffect(() => {
    const fetchFlights = async () => {
      const snapshot = await get(ref(db, 'flights/'));
      if (snapshot.exists()) {
        const raw = snapshot.val();
        const allFlights = Object.values(raw);
        setFlights(allFlights);
      }
    };
    fetchFlights();
  }, []);

  const uniqueCities = (key: 'from' | 'to') => {
    return Array.from(new Set(flights.map((f) => f[key])));
  };

  const formatDate = (d: Date) => {
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  };

  const onSearch = () => {
    if (from === to) {
      Alert.alert('Invalid selection', 'Departure and destination cannot be the same.');
      return;
    }
  
    const formattedDate = formatDate(date);
    const selectedMonth = date.getMonth();
    const selectedYear = date.getFullYear();
  
    const filtered = flights.filter((f) => {
      const flightDate = new Date(f.date);
      return (
        f.from === from &&
        f.to === to &&
        flightDate.getMonth() === selectedMonth &&
        flightDate.getFullYear() === selectedYear
      );
    });
  
    const sameDayResults = filtered.filter(f => f.date === formattedDate);
  
    if (filtered.length === 0) {
      Alert.alert('No Flights Found', 'There is no flight in this month.');
      setResults([]);
      return;
    }
  
    if (sameDayResults.length === 0) {
      Alert.alert('No Flights on Selected Date', 'Try a different day within the same month.');
    }
  
    setResults(sameDayResults);
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
    <ImageBackground source={require('../assets/bg.jpg')} style={styles.bg}>
      <View style={styles.container}>
        <Text style={styles.header}>✈️  Explore Flights ✈️</Text>
        <TouchableOpacity
          style={styles.bookingsButton}
          onPress={() => navigation.navigate('MyBookings')}
        >
          <Text style={styles.bookingsText}>My Bookings</Text>
        </TouchableOpacity>

        <View style={styles.searchBox}>
          <Text style={styles.label}>From</Text>
          <TouchableOpacity onPress={() => setShowFromModal(true)} style={styles.modalButton}>
            <Text style={styles.modalButtonText}>{from || 'Select departure'}</Text>
          </TouchableOpacity>

          <Text style={styles.label}>To</Text>
          <TouchableOpacity onPress={() => setShowToModal(true)} style={styles.modalButton}>
            <Text style={styles.modalButtonText}>{to || 'Select destination'}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.dateButton}
            onPress={() => setShowDatePicker(true)}
          >
            <Text style={styles.dateButtonText}>{date.toDateString()}</Text>
          </TouchableOpacity>

          {showDatePicker && (
            <DateTimePicker
              value={date}
              mode="date"
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              onChange={(event, selectedDate) => {
                const currentDate = selectedDate || date;
                setShowDatePicker(Platform.OS === 'ios');
                setDate(currentDate);
              }}
            />
          )}

          <TouchableOpacity style={styles.searchButton} onPress={onSearch}>
            <Text style={styles.searchButtonText}>Search</Text>
          </TouchableOpacity>
        </View>

        <FlatList
          data={results}
          keyExtractor={(item, index) => index.toString()}
          renderItem={({ item }) => (
            <TouchableOpacity onPress={() => navigation.navigate('FlightDetails', { flight: item })}>
              <View style={styles.card}>
                <Image source={getLocationImage(item.to)} style={styles.bannerImage} />
                <Text style={styles.flight}>{item.airline} - {item.flight_id}</Text>
                <Text style={styles.route}>{item.from} → {item.to}</Text>
                <Text style={styles.details}>{item.date} | {item.time}</Text>
                <Text style={styles.price}>${item.price}</Text>
              </View>
            </TouchableOpacity>
          )}
        />

        {/* Modal for From */}
        <Modal visible={showFromModal} transparent={true} animationType="slide">
          <View style={styles.modalContainer}>
            {uniqueCities('from').map((city) => (
              <Pressable
                key={city}
                style={styles.option}
                onPress={() => {
                  setFrom(city);
                  setShowFromModal(false);
                }}
              >
                <Text style={styles.optionText}>{city}</Text>
              </Pressable>
            ))}
          </View>
        </Modal>

        {/* Modal for To */}
        <Modal visible={showToModal} transparent={true} animationType="slide">
          <View style={styles.modalContainer}>
            {uniqueCities('to').map((city) => (
              <Pressable
                key={city}
                style={styles.option}
                onPress={() => {
                  setTo(city);
                  setShowToModal(false);
                }}
              >
                <Text style={styles.optionText}>{city}</Text>
              </Pressable>
            ))}
          </View>
        </Modal>
      </View>
    </ImageBackground>
  );
};

export default SearchScreen;

const styles = StyleSheet.create({
  bg: {
    flex: 1,
    resizeMode: 'cover',
  },
  container: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.92)',
    padding: 20,
  },
  header: {
    fontSize: 26,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  searchBox: {
    backgroundColor: '#f5f5f5',
    borderRadius: 10,
    padding: 15,
    marginBottom: 20,
    gap: 10,
  },
  modalButton: {
    backgroundColor: '#fff',
    borderRadius: 6,
    padding: 10,
    marginBottom: 5,
  },
  modalButtonText: {
    fontSize: 16,
    color: '#333',
  },
  dateButton: {
    backgroundColor: '#fff',
    borderRadius: 6,
    padding: 10,
    alignItems: 'center',
  },
  dateButtonText: {
    color: '#333',
    fontSize: 16,
  },
  searchButton: {
    backgroundColor: '#36cfc9',
    paddingVertical: 12,
    borderRadius: 6,
    alignItems: 'center',
  },
  searchButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 10,
    marginVertical: 8,
    overflow: 'hidden',
    elevation: 3,
  },
  bannerImage: {
    width: '100%',
    height: 160,
  },
  flight: {
    fontWeight: 'bold',
    fontSize: 16,
    marginTop: 10,
    paddingHorizontal: 10,
  },
  route: {
    color: '#555',
    marginTop: 2,
    paddingHorizontal: 10,
  },
  details: {
    color: '#888',
    fontSize: 12,
    paddingHorizontal: 10,
    marginBottom: 10,
  },
  price: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#36cfc9',
    paddingHorizontal: 10,
    paddingBottom: 10,
  },
  modalContainer: {
    backgroundColor: '#ffffffee',
    marginTop: '50%',
    borderRadius: 10,
    padding: 20,
    marginHorizontal: 20,
  },
  option: {
    paddingVertical: 10,
  },
  optionText: {
    fontSize: 18,
    color: '#333',
  },
  bookingsButton: {
    alignSelf: 'flex-end',
    backgroundColor: '#36cfc9',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    marginBottom: 10,
  },
  bookingsText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  
});
