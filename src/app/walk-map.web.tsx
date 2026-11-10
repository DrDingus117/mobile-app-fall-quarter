import { ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { MaxContentWidth, Spacing } from '@/constants/theme';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';

export default function WalkMapWebScreen() {
  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <ScrollView contentContainerStyle={styles.content}>
          <ThemedText type="subtitle">Walk Map</ThemedText>
          <ThemedView type="backgroundElement" style={styles.notice}>
            <ThemedText type="smallBold">Map tracking is available in the mobile app</ThemedText>
            <ThemedText>
              The live map uses native location and map features that are not available in the web
              build. Open this screen on an iOS or Android device to view your location and record
              a walk.
            </ThemedText>
          </ThemedView>
          <ThemedView type="backgroundElement" style={styles.destination}>
            <ThemedText type="smallBold">Destination: Tacoma Mall</ThemedText>
            <ThemedText>Latitude: 47.217</ThemedText>
            <ThemedText>Longitude: -122.4685</ThemedText>
            <ThemedText>Radius: 250 meters</ThemedText>
          </ThemedView>
        </ScrollView>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  safeArea: {
    flex: 1,
    maxWidth: MaxContentWidth,
  },
  content: {
    padding: Spacing.four,
    gap: Spacing.three,
  },
  notice: {
    padding: Spacing.three,
    borderRadius: Spacing.two,
    gap: Spacing.two,
  },
  destination: {
    padding: Spacing.three,
    borderRadius: Spacing.two,
    gap: Spacing.one,
  },
});
