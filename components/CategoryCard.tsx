import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Category } from "../types/Category";
import { Colors } from "../constants/colors";
import { Spacing } from "../constants/spacing";

export default function CategoryCard({
  category,
  onPress,
}: {
  category: Category;
  onPress?: () => void;
}) {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress}>
      <Text style={styles.text}>{category.name}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: Spacing.md,
    backgroundColor: Colors.surface,
    borderRadius: 10,
    marginRight: Spacing.sm,
  },
  text: {
    color: Colors.textPrimary,
  },
});
