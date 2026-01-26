import { FlatList, View } from "react-native";
import { useEffect, useState } from "react";
import { getCategories } from "../../services/categoryService";
import CategoryCard from "../../components/CategoryCard";
import { Category } from "../../types/Category";

export default function CategoriesScreen() {
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    getCategories().then(setCategories);
  }, []);

  return (
    <View style={{ padding: 16 }}>
      <FlatList
        data={categories}
        numColumns={2}
        keyExtractor={(i) => i.id}
        renderItem={({ item }) => <CategoryCard category={item} />}
      />
    </View>
  );
}
