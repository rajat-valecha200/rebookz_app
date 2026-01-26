import { View, Text, Image, StyleSheet, TouchableOpacity } from "react-native";
import { Book } from "../types/Book";
import { Colors } from "../constants/colors";
import { Spacing } from "../constants/spacing";
import { Typography } from "../constants/typography";

export default function BookCard({
  book,
  onPress,
}: {
  book: Book;
  onPress?: () => void;
}) {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress}>
      <Image
        source={require("../assets/images/placeholder-book.png")}
        style={styles.image}
      />
      <Text numberOfLines={2} style={styles.title}>
        {book.title}
      </Text>
      <Text style={styles.price}>
        {book.priceType === "FREE"
          ? "FREE"
          : `${book.priceType} ₹${book.price ?? ""}`}
      </Text>
      <Text style={styles.distance}>{book.distance} km away</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    width: 140,
    marginRight: Spacing.md,
  },
  image: {
    width: "100%",
    height: 160,
    borderRadius: 8,
    backgroundColor: Colors.surface,
  },
  title: {
    ...Typography.body,
    marginTop: Spacing.sm,
  },
  price: {
    ...Typography.small,
    color: Colors.primary,
  },
  distance: {
    ...Typography.small,
    color: Colors.textSecondary,
  },
});
