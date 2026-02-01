import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Colors } from '../constants/colors';
import { Spacing } from '../constants/spacing';

export default function SearchBar() {
  const handlePress = () => {
    router.push('/search');
  };

  return (
    <TouchableOpacity style={styles.container} activeOpacity={0.7} onPress={handlePress}>
      <View style={styles.searchBox}>
        <Ionicons name="search" size={20} color={Colors.textSecondary} />
        <Text style={styles.inputText}>Search books, authors...</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: 25,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  inputText: {
    flex: 1,
    marginLeft: Spacing.sm,
    fontSize: 16,
    color: Colors.textSecondary,
  },
});