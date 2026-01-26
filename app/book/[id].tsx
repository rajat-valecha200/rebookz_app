import { View, Text } from "react-native";
import { useLocalSearchParams } from "expo-router";

export default function BookDetails() {
  const { id } = useLocalSearchParams();

  return (
    <View style={{ padding: 16 }}>
      <Text>Book ID: {id}</Text>
    </View>
  );
}
