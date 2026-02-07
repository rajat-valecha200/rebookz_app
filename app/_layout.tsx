// app/_layout.tsx
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider } from '../context/AuthContext';
import { LocationProvider } from '../context/LocationContext';
import { ThemeProvider, useTheme } from '../context/ThemeContext'; // Import ThemeProvider
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import { View } from 'react-native';

// Prevent auto hide
SplashScreen.preventAutoHideAsync();

// Create a component to separate Theme logic
const AppLayout = () => {
  const { colors, theme } = useTheme();

  return (
    <>
      <StatusBar style={theme === 'dark' ? 'light' : 'dark'} backgroundColor={colors.background} />
      <Stack screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.background },
        headerStyle: { backgroundColor: colors.background },
        headerTintColor: colors.textPrimary,
      }}>
        {/* Screens */}
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="login" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />

        <Stack.Screen
          name="book/[id]"
          options={{
            headerShown: false,
            title: 'Book Details',
          }}
        />

        <Stack.Screen
          name="add-book"
          options={{
            headerShown: true,
            title: 'Add Book',
            headerStyle: { backgroundColor: colors.background },
            headerTintColor: colors.textPrimary,
          }}
        />

        <Stack.Screen
          name="favourites"
          options={{
            headerShown: true,
            title: 'My Favorites',
            headerStyle: { backgroundColor: colors.background },
            headerTintColor: colors.textPrimary,
          }}
        />

        <Stack.Screen name="category-books" options={{ headerShown: false }} />
        <Stack.Screen name="search" options={{ headerShown: false }} />
        <Stack.Screen
          name="map-picker"
          options={{
            headerShown: false,
            presentation: 'modal',
            gestureEnabled: true,
          }}
        />

        {/* Add Request Book Screen explicitly to ensure it picks up theme or header settings if needed */}
        <Stack.Screen name="request-book" options={{ headerShown: false }} />
        <Stack.Screen name="requests" options={{ headerShown: false }} />
      </Stack>
    </>
  );
};

export default function RootLayout() {
  useEffect(() => {
    SplashScreen.hideAsync();
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <AuthProvider>
          <LocationProvider>
            <ThemeProvider>
              <AppLayout />
            </ThemeProvider>
          </LocationProvider>
        </AuthProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}