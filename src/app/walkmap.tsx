import * as Location from 'expo-location';
import { useEffect, useRef, useState } from 'react';
import { Button, ScrollView, StyleSheet, Text, View } from 'react-native';
import MapView, { Circle, Marker, Polyline } from 'react-native-maps';
import { SafeAreaView } from 'react-native-safe-area-context';

type Coord = { latitude: number; longitude: number };
type DestStatus = 'unknown' | 'inside' | 'outside';
type TrackingStatus = 'Not Tracking' | 'Tracking' | 'Walk Stopped';
type DestEvent = { id: string; type: 'Entered' | 'Exited'; name: string; time: string };

// CHANGE THESE to a public place near where you will test (not a home address).
// Tip: a bigger radius (like 150) makes testing easier. Put your choice in the README.
const destination = {
  name: 'Test Park',
  latitude: 47.2603,
  longitude: -122.4338,
  radius: 100, // meters
};

// Haversine formula: distance in meters between two coordinates
function getDistanceMeters(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371000;
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export default function WalkMapScreen() {
  const [permissionGranted, setPermissionGranted] = useState(false);
  const [permissionMessage, setPermissionMessage] = useState('Requesting location permission...');
  const [statusMessage, setStatusMessage] = useState('');
  const [currentLocation, setCurrentLocation] = useState<Coord | null>(null);
  const [route, setRoute] = useState<Coord[]>([]);
  const [trackingStatus, setTrackingStatus] = useState<TrackingStatus>('Not Tracking');
  const [distance, setDistance] = useState<number | null>(null);
  const [events, setEvents] = useState<DestEvent[]>([]);
  const [banner, setBanner] = useState<{ title: string; body: string } | null>(null);

  const mapRef = useRef<MapView>(null);
  const subscriptionRef = useRef<Location.LocationSubscription | null>(null);
  // A ref (not state) so the location callback always sees the latest value
  const destStatusRef = useRef<DestStatus>('unknown');

  const isTracking = trackingStatus === 'Tracking';

  // Check inside/outside and create an event ONLY when the status changes
  function checkDestination(coord: Coord) {
    const d = getDistanceMeters(
      coord.latitude,
      coord.longitude,
      destination.latitude,
      destination.longitude
    );
    setDistance(Math.round(d));

    const newStatus: DestStatus = d <= destination.radius ? 'inside' : 'outside';
    const oldStatus = destStatusRef.current;

    if (newStatus === oldStatus) return; // no change, no duplicate event
    destStatusRef.current = newStatus;
    if (oldStatus === 'unknown') return; // first reading just sets the starting status

    const type = newStatus === 'inside' ? 'Entered' : 'Exited';
    const event: DestEvent = {
      id: `${Date.now()}-${type}`,
      type,
      name: destination.name,
      time: new Date().toLocaleString(),
    };
    setEvents((prev) => [event, ...prev]); // newest first

    if (type === 'Entered') {
      setBanner({
        title: 'Destination Reached',
        body: `You have entered the ${destination.name} area.`,
      });
      setStatusMessage('You entered the destination area.');
    } else {
      setBanner({
        title: 'Leaving Destination',
        body: `You have left the ${destination.name} area.`,
      });
      setStatusMessage('You exited the destination area.');
    }
  }

  function handleNewLocation(coord: Coord, addToRoute: boolean) {
    setCurrentLocation(coord);
    if (addToRoute) setRoute((prev) => [...prev, coord]);
    checkDestination(coord);
    mapRef.current?.animateToRegion(
      { ...coord, latitudeDelta: 0.005, longitudeDelta: 0.005 },
      500
    );
  }

  // Ask for permission and get the first location when the screen opens
  useEffect(() => {
    async function setup() {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          setPermissionGranted(false);
          setPermissionMessage(
            'Location permission denied. Location access is required to display your position and track your walking route.'
          );
          return;
        }
        setPermissionGranted(true);
        setPermissionMessage('Location permission approved.');

        const loc = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });
        handleNewLocation(
          { latitude: loc.coords.latitude, longitude: loc.coords.longitude },
          false
        );
        setStatusMessage('Current location found.');
      } catch (error) {
        setStatusMessage(
          "Current location is unavailable. Please check your device's location settings and try again."
        );
      }
    }
    setup();

    // Stop listening if the screen closes
    return () => {
      subscriptionRef.current?.remove();
      subscriptionRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function startWalk() {
    if (!permissionGranted) return;
    try {
      subscriptionRef.current?.remove();
      setRoute([]); // clear the previous walk
      setTrackingStatus('Tracking');
      setStatusMessage('Walk started. Recording route points.');

      subscriptionRef.current = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.High,
          distanceInterval: 2, // meters between updates
          timeInterval: 2000,
        },
        (loc) => {
          handleNewLocation(
            { latitude: loc.coords.latitude, longitude: loc.coords.longitude },
            true
          );
        }
      );
    } catch (error) {
      setTrackingStatus('Not Tracking');
      setStatusMessage('Location is temporarily unavailable.');
    }
  }

  function stopWalk() {
    subscriptionRef.current?.remove();
    subscriptionRef.current = null;
    setTrackingStatus('Walk Stopped');
    setStatusMessage('Walk stopped. The completed route remains on the map.');
  }

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.heading}>Walk Map</Text>

      <MapView
        ref={mapRef}
        style={styles.map}
        initialRegion={{
          latitude: destination.latitude,
          longitude: destination.longitude,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        }}
      >
        {currentLocation && <Marker coordinate={currentLocation} title="You are here" />}
        <Marker
          coordinate={{ latitude: destination.latitude, longitude: destination.longitude }}
          title={destination.name}
          pinColor="blue"
        />
        <Circle
          center={{ latitude: destination.latitude, longitude: destination.longitude }}
          radius={destination.radius}
          strokeColor="rgba(0, 100, 255, 0.8)"
          fillColor="rgba(0, 100, 255, 0.2)"
        />
        {route.length >= 2 && (
          <Polyline coordinates={route} strokeColor="#e53935" strokeWidth={4} />
        )}
      </MapView>

      <View style={styles.buttonRow}>
        <View style={styles.buttonWrap}>
          <Button
            title="Start Walk"
            onPress={startWalk}
            disabled={!permissionGranted || isTracking}
          />
        </View>
        <View style={styles.buttonWrap}>
          <Button title="Stop Walk" onPress={stopWalk} disabled={!isTracking} />
        </View>
      </View>

      <ScrollView style={styles.info} contentContainerStyle={styles.infoContent}>
        {banner && (
          <View style={styles.banner}>
            <Text style={styles.bannerTitle}>{banner.title}</Text>
            <Text>{banner.body}</Text>
          </View>
        )}

        <Text style={styles.line}>{permissionMessage}</Text>
        {statusMessage !== '' && <Text style={styles.line}>{statusMessage}</Text>}

        <Text style={styles.bold}>Tracking Status: {trackingStatus}</Text>
        <Text style={styles.line}>Route Points: {route.length}</Text>

        {currentLocation && (
          <>
            <Text style={styles.line}>Current Latitude: {currentLocation.latitude.toFixed(4)}</Text>
            <Text style={styles.line}>Current Longitude: {currentLocation.longitude.toFixed(4)}</Text>
          </>
        )}

        <Text style={styles.bold}>Destination: {destination.name}</Text>
        <Text style={styles.line}>Destination Latitude: {destination.latitude}</Text>
        <Text style={styles.line}>Destination Longitude: {destination.longitude}</Text>
        <Text style={styles.line}>Destination Radius: {destination.radius} meters</Text>
        {distance !== null && (
          <Text style={styles.line}>Distance to Destination: {distance} meters</Text>
        )}

        <Text style={styles.bold}>Destination Event Log (newest first)</Text>
        {events.length === 0 ? (
          <Text style={styles.line}>No destination events recorded.</Text>
        ) : (
          events.map((e) => (
            <Text key={e.id} style={styles.line}>
              {e.type} | {e.name} | {e.time}
            </Text>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  heading: { fontSize: 24, fontWeight: 'bold', textAlign: 'center', marginVertical: 8 },
  map: { width: '100%', height: 280 },
  buttonRow: { flexDirection: 'row', justifyContent: 'space-around', paddingVertical: 8 },
  buttonWrap: { flex: 1, marginHorizontal: 12 },
  info: { flex: 1 },
  infoContent: { padding: 12, paddingBottom: 40, gap: 4 },
  banner: {
    backgroundColor: '#fff3cd',
    borderColor: '#e0a800',
    borderWidth: 1,
    borderRadius: 8,
    padding: 10,
    marginBottom: 8,
  },
  bannerTitle: { fontWeight: 'bold', fontSize: 16 },
  line: { fontSize: 14 },
  bold: { fontSize: 15, fontWeight: 'bold', marginTop: 8 },
});