import { DarkTheme, DefaultTheme, Tabs, ThemeProvider } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useColorScheme } from 'react-native';

import { AnimatedSplashOverlay } from '@/components/animated-icon';

SplashScreen.preventAutoHideAsync();

export default function TabLayout() {
  const colorScheme = useColorScheme();
  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <AnimatedSplashOverlay />
      <Tabs>
        <Tabs.Screen name="index" options={{ title: 'Home' }} />
        <Tabs.Screen name="explore" options={{ title: 'Explore' }} />
        {/* The tracker screen (was walk.tsx) */}
        <Tabs.Screen name="tracker" options={{ title: 'Walk' }} />
        {/* The new Walk Map screen */}
        <Tabs.Screen name="walk-map" options={{ title: 'Walk Map' }} />
      </Tabs>
    </ThemeProvider>
  );
}