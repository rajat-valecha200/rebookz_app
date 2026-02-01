// app/_layout.tsx
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider } from '../context/AuthContext';
import { LocationProvider } from '../context/LocationContext';
import { Colors } from '../constants/colors';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <AuthProvider>
          <LocationProvider>
            <StatusBar style="dark" backgroundColor={Colors.background} />
            <Stack screenOptions={{
              headerShown: false,
              contentStyle: { backgroundColor: Colors.background }
            }}>
              {/* INDEX SCREEN ADD KARO agar nahi hai to */}
              <Stack.Screen name="index" options={{ headerShown: false }} />

              {/* LOGIN SCREEN ADD KARO agar nahi hai to */}
              <Stack.Screen name="login" options={{ headerShown: false }} />

              {/* Baki ke screens */}
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
                  headerStyle: {
                    backgroundColor: Colors.background,
                  },
                  headerTintColor: Colors.textPrimary,
                }}
              />

              <Stack.Screen
                name="favourites"
                options={{
                  headerShown: true,
                  title: 'My Favorites',
                  headerStyle: {
                    backgroundColor: Colors.background,
                  },
                  headerTintColor: Colors.textPrimary,
                }}
              />

              <Stack.Screen
                name="category-books"
                options={{
                  headerShown: false,
                }}
              />

              <Stack.Screen
                name="search"
                options={{
                  headerShown: false,
                }}
              />

              <Stack.Screen
                name="map-picker"
                options={{
                  headerShown: false,
                  presentation: 'modal',
                  gestureEnabled: true, // Yeh add karo
                }}
              />
            </Stack>
          </LocationProvider>
        </AuthProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}