import { View, FlatList } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Header from "../../components/Header";
import BookCard from "../../components/BookCard";
import FloatingButton from "../../components/FloatingButton";
import { getBooks } from "../../services/bookService";
import { useEffect, useState } from "react";
import { Book } from "../../types/Book";
import { router } from "expo-router";
import { useLocation } from "../../context/LocationContext";
import { Colors } from "../../constants/colors";

export default function HomeScreen() {
  const [books, setBooks] = useState<Book[]>([]);
  const { location } = useLocation();

  useEffect(() => {
    getBooks().then(setBooks);
  }, []);

  return (
    <SafeAreaView
      style={{
        flex: 1,
        backgroundColor: Colors.background,
      }}
      edges={["top"]}
    >
      {/* HEADER */}
      <Header
        title="ReBookz"
        location={location?.city}
        onSearchPress={() => {}}
      />

      {/* CONTENT */}
      <FlatList
        data={books}
        horizontal
        keyExtractor={(item) => item.id}
        contentContainerStyle={{
          paddingHorizontal: 16,
          paddingBottom: 120,
        }}
        showsHorizontalScrollIndicator={false}
        renderItem={({ item }) => (
          <BookCard
            book={item}
            onPress={() => router.push(`/book/${item.id}`)}
          />
        )}
      />

      {/* FLOATING BUTTON */}
      <FloatingButton onPress={() => router.push("/add-book")} />
    </SafeAreaView>
  );
}
