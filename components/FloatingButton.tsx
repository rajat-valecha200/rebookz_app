import React from 'react';
import { TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Colors } from '../constants/colors';
import { useAuth } from '../context/AuthContext';

interface FloatingButtonProps {
  bottomInset?: number;
}

export default function FloatingButton({ bottomInset = 20 }: FloatingButtonProps) {
  const { isAuthenticated } = useAuth();

  const handlePress = () => {
    if (isAuthenticated) {
      router.push('/add-book');
    } else {
      router.push('/login');
    }
  };

  const bottomPosition = Platform.OS === 'ios' ? 20 + bottomInset : 20 + bottomInset;

  return (
    <TouchableOpacity 
      style={[styles.container, { bottom: bottomPosition }]} 
      onPress={handlePress}
      activeOpacity={0.8}
    >
      <Ionicons name="add" size={28} color={Colors.background} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    right: 20,
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 8,
    zIndex: 1000,
  },
});