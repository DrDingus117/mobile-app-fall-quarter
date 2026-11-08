import { StyleSheet, Text, View } from 'react-native';
import MapView from 'react-native-maps';

export default function WalkMapScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Walk Map</Text>
      <MapView style={styles.map} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingTop: 50 },
  heading: { fontSize: 24, fontWeight: 'bold', textAlign: 'center', marginBottom: 10 },
  map: { width: '100%', height: 300 },
});