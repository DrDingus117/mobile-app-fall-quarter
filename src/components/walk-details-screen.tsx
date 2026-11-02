import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { findWalkById } from '@/data/walks';
import * as Linking from 'expo-linking';
import { useEffect, useState } from 'react';
import { Alert, Button, StyleSheet, View } from 'react-native';

type Props = {
  walkId?: string | null;
};

const MAPS_ERROR =
  'Unable to open the maps app. Please try again on a device with a compatible maps app.';
const WEB_ERROR = 'Unable to open the location in a web browser.';

export default function WalkDetailsScreen({ walkId }: Props) {
  const [actionStatus, setActionStatus] = useState<string | null>(null);

  // Clear any button message when a different link opens this screen
  useEffect(() => {
    setActionStatus(null);
  }, [walkId]);

  const id = (walkId ?? '').trim();
  const walk = id ? findWalkById(id) : undefined;

  // Status message for the link itself
  let linkStatus: string;
  if (!id) {
    linkStatus = 'A walk ID is required.';
  } else if (!walk) {
    linkStatus = 'Walk not found. Please check the walk ID.';
  } else {
    linkStatus = `Walk ${walk.id} loaded successfully.`;
  }

  // A button message (if there is one) replaces the link message
  const statusMessage = actionStatus ?? linkStatus;

  async function openExternal(url: string, openingMessage: string, errorMessage: string) {
    try {
      const supported = await Linking.canOpenURL(url);
      if (!supported) {
        setActionStatus(errorMessage);
        Alert.alert('Cannot open', errorMessage);
        return;
      }
      setActionStatus(openingMessage);
      await Linking.openURL(url);
    } catch {
      // The app keeps running even if the action fails
      setActionStatus(errorMessage);
      Alert.alert('Cannot open', errorMessage);
    }
  }

  function openInMaps() {
    if (!walk) return;
    const url = `https://www.google.com/maps/search/?api=1&query=${walk.startLatitude},${walk.startLongitude}`;
    openExternal(url, 'Opening the starting location in Maps.', MAPS_ERROR);
  }

  function openInBrowser() {
    if (!walk) return;
    const { startLatitude: lat, startLongitude: lon } = walk;
    const url = `https://www.openstreetmap.org/?mlat=${lat}&mlon=${lon}#map=16/${lat}/${lon}`;
    openExternal(url, 'Opening the starting location in your browser.', WEB_ERROR);
  }

  return (
    <ThemedView style={styles.container}>
      <ThemedText type="title">Walk Details</ThemedText>

      {walk && (
        <View style={styles.details}>
          <ThemedText>Walk ID: {walk.id}</ThemedText>
          <ThemedText>Date and Time: {walk.dateTime}</ThemedText>
          <ThemedText>Starting Latitude: {walk.startLatitude}</ThemedText>
          <ThemedText>Starting Longitude: {walk.startLongitude}</ThemedText>
          <ThemedText>Status: {walk.status}</ThemedText>
        </View>
      )}

      <ThemedText style={styles.status}>{statusMessage}</ThemedText>

      {walk && (
        <View style={styles.buttons}>
          <Button title="Open Starting Location in Maps" onPress={openInMaps} />
          <Button title="View Location on the Web" onPress={openInBrowser} />
        </View>
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, gap: 16 },
  details: { gap: 8 },
  status: { fontWeight: '600' },
  buttons: { gap: 12 },
});
