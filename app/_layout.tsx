import { Stack } from "expo-router";
import { AuthProvider } from "../context/AuthContext";
import { LocationProvider } from "../context/LocationContext";

export default function RootLayout() {
  return (
    <AuthProvider>
      <LocationProvider>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="book/[id]" />
          <Stack.Screen name="add-book" />
          <Stack.Screen name="favourites" />
        </Stack>
      </LocationProvider>
    </AuthProvider>
  );
}
