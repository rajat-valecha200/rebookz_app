import { createContext, useContext, useEffect, useState } from "react";
import * as Location from "expo-location";

type LocationType = {
  city: string;
  lat: number;
  lng: number;
};

type LocationContextType = {
  location: LocationType | null;
  setLocation: (loc: LocationType) => void;
  loading: boolean;
};

const LocationContext = createContext<LocationContextType | null>(null);

export const LocationProvider = ({ children }: { children: React.ReactNode }) => {
  const [location, setLocation] = useState<LocationType | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const { status } =
          await Location.requestForegroundPermissionsAsync();
        if (status !== "granted") {
          setLoading(false);
          return;
        }

        const pos = await Location.getCurrentPositionAsync({});
        const geo = await Location.reverseGeocodeAsync({
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
        });

        setLocation({
          city: geo[0]?.city || "Unknown",
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        });
      } catch (e) {
        console.log("Location error", e);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <LocationContext.Provider value={{ location, setLocation, loading }}>
      {children}
    </LocationContext.Provider>
  );
};

export const useLocation = () => {
  const ctx = useContext(LocationContext);
  if (!ctx) throw new Error("LocationContext missing");
  return ctx;
};
