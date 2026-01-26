import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "../constants/colors";
import { Spacing } from "../constants/spacing";
import { Typography } from "../constants/typography";

export default function Header({
  title,
  location,
  onSearchPress,
}: {
  title: string;
  location?: string;
  onSearchPress?: () => void;
}) {
  return (
    <View style={styles.container}>
      <View>
        <Text style={styles.title}>{title}</Text>
        {location && (
          <View style={styles.locationRow}>
            <Ionicons
              name="location-outline"
              size={14}
              color={Colors.textSecondary}
            />
            <Text style={styles.location}>{location}</Text>
          </View>
        )}
      </View>

      <TouchableOpacity onPress={onSearchPress}>
        <Ionicons name="search-outline" size={22} color={Colors.textPrimary} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.sm,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  title: {
    ...Typography.heading,
    color: Colors.textPrimary,
  },
  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 2,
  },
  location: {
    ...Typography.small,
    marginLeft: 4,
    color: Colors.textSecondary,
  },
});
