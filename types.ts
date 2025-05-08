export type Flight = {
    id: string;
    from: string;
    to: string;
    date: string;
    time: string;
  };
export type Navigation = {
    navigate: (scene: string) => void;
  }; 
export type RootStackParamList = {
    Welcome: undefined;
    Login: undefined;
    Signup: undefined;
    Tabs: { screen: 'Home' | 'Search' | 'MyBookings' } | undefined;
    Home: undefined;
    Search: undefined;
    MyBookings: undefined;
    FlightDetails: { flight: any };
    Booking: { flight: any };
};
  