import { TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "../constants/colors";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function FloatingButton({ onPress }: { onPress: () => void }) {
  const insets = useSafeAreaInsets();

  return (
    <TouchableOpacity
      style={[
        styles.btn,
        {
          bottom: insets.bottom + 16, // 🔥 SAFE
        },
      ]}
      onPress={onPress}
    >
      <Ionicons name="add" size={28} color="#fff" />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  btn: {
    position: "absolute",
    right: 20,
    backgroundColor: Colors.primary,
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
    elevation: 5,
  },
});
