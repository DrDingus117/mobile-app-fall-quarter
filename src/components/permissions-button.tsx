import * as Location from "expo-location";
import * as TaskManager from "expo-task-manager";
import { Alert, Button, StyleSheet, View } from "react-native";

export const LOCATION_TASK_NAME = "background-location-task";

type Props = {
  title?: string;
  onStarted?: () => void; // called after permissions are granted and tracking has started
};

// Must be defined at module scope (not inside a component)
TaskManager.defineTask(LOCATION_TASK_NAME, async ({ data, error }) => {
  if (error) {
    // Error occurred - check `error.message` for more details.
    return;
  }
  if (data) {
    const { locations } = data as { locations: Location.LocationObject[] };
    // do something with the locations captured in the background
    console.log(locations);
  }
});

export async function stopBackgroundLocation() {
  const started = await Location.hasStartedLocationUpdatesAsync(
    LOCATION_TASK_NAME,
  ).catch(() => false);
  if (started) {
    await Location.stopLocationUpdatesAsync(LOCATION_TASK_NAME);
  }
}

const PermissionsButton = ({
  title = "Enable background location",
  onStarted,
}: Props) => {
  const requestPermissions = async () => {
    const { status: foregroundStatus } =
      await Location.requestForegroundPermissionsAsync();
    console.log("foregroundStatus", foregroundStatus);
    if (foregroundStatus !== "granted") {
      Alert.alert(
        "Location needed",
        "Please allow location access to start a walk.",
      );
      return;
    }

    const { status: backgroundStatus } =
      await Location.requestBackgroundPermissionsAsync();
    console.log("backgroundStatus", backgroundStatus);
    if (backgroundStatus !== "granted") {
      Alert.alert(
        "Background location needed",
        'Choose "Allow all the time" in settings so the walk keeps tracking with the screen off.',
      );
      return;
    }

    try {
      await Location.startLocationUpdatesAsync(LOCATION_TASK_NAME, {
        accuracy: Location.Accuracy.Balanced,
        foregroundService: {
          notificationTitle: "Walk in progress",
          notificationBody: "Tracking your route",
        },
      });
      onStarted?.();
    } catch (e) {
      Alert.alert("Could not start tracking", `${e}`);
    }
  };

  return (
    <View style={styles.container}>
      <Button onPress={requestPermissions} title={title} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
  },
});

export default PermissionsButton;
